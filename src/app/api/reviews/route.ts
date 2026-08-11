import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  bookingId: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(500).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { bookingId, rating, comment } = parsed.data;

  // Vérifier que le booking appartient bien à cet utilisateur
  const dbUser = await db.user.findUnique({
    where:  { clerkId: userId },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const booking = await db.booking.findUnique({
    where:   { id: bookingId },
    include: { review: true, session: true },
  });

  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  // Ownership : booking.userId direct, OU email match si l'email Clerk est
  // vérifié (sinon un attaquant crée un compte Clerk avec l'email d'un guest
  // et review à sa place). Depuis fix `webhooks/clerk`, dbUser.email n'est
  // écrit que si Clerk a confirmé la possession de l'adresse.
  const owns =
    booking.userId === dbUser.id ||
    (dbUser.emailVerified && booking.participantEmail === dbUser.email);
  if (!owns) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Pas deux fois
  if (booking.review) return NextResponse.json({ error: "Avis déjà soumis" }, { status: 409 });

  // Créer l'avis
  await db.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId,
        sessionId: booking.sessionId,
        authorId:  dbUser.id,
        rating,
        comment:   comment ?? null,
      },
    });

    // Recalculer la note moyenne du coach
    const reviews = await tx.review.findMany({
      where:  { sessionId: booking.sessionId, isVisible: true },
      select: { rating: true },
    });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    await tx.coachProfile.update({
      where: { id: booking.session.coachId },
      data:  { avgRating: Math.round(avg * 10) / 10 },
    });
  });

  return NextResponse.json({ ok: true });
}
