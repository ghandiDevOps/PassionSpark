import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  qrToken: z.string().uuid(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Vérifier que c'est le coach de la session
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "QR code invalide" }, { status: 400 });
  }

  const { qrToken } = parsed.data;

  try {
    // Vérifier que l'utilisateur est bien le coach de cette session
    const session = await db.session.findUnique({
      where: { id: params.id },
      include: { coach: { include: { user: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    if (session.coach.user.clerkId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Trouver le booking par QR token
    const booking = await db.booking.findUnique({
      where: { qrToken },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "QR code invalide", code: "INVALID_TOKEN" },
        { status: 404 },
      );
    }

    if (booking.sessionId !== params.id) {
      return NextResponse.json(
        { error: "Ce QR code ne correspond pas à cette session", code: "WRONG_SESSION" },
        { status: 400 },
      );
    }

    if (booking.status === "attended") {
      return NextResponse.json(
        {
          error: "QR code déjà scanné",
          code: "ALREADY_SCANNED",
          scannedAt: booking.scannedAt,
          participantName: booking.participantName,
        },
        { status: 409 },
      );
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Réservation non confirmée", code: "NOT_CONFIRMED" },
        { status: 400 },
      );
    }

    // Valider la présence
    const updated = await db.booking.update({
      where: { id: booking.id },
      data: {
        status:    "attended",
        scannedAt: new Date(),
      },
    });

    return NextResponse.json({
      success:         true,
      participantName: updated.participantName,
      scannedAt:       updated.scannedAt,
    });
  } catch (err) {
    console.error("[Scan] Error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
