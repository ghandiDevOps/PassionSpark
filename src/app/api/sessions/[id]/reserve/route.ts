import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentIntent } from "@/lib/stripe";
import { generateQrToken } from "@/lib/utils/generate-qr-token";

const schema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  let bookingId: string | null  = null;
  let sessionId: string | null  = null;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 },
      );
    }

    const { name, email } = parsed.data;

    // ── 1. Vérification atomique des places disponibles ──────────────────────
    const result = await db.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: params.id },
        include: { coach: true },
      });

      if (!session) throw new Error("SESSION_NOT_FOUND");
      if (session.status !== "published") throw new Error("SESSION_NOT_AVAILABLE");
      // On accepte les réservations même si Stripe n'est pas encore actif —
      // le PaymentIntent sera sans destination charge (collecte plateforme).
      if (!session.coach.stripeAccountId) throw new Error("COACH_STRIPE_NOT_CONFIGURED");

      const reservation = await tx.session.updateMany({
        where: {
          id:         params.id,
          status:     "published",
          spotsTaken: { lt: session.maxSpots },
        },
        data: { spotsTaken: { increment: 1 } },
      });

      if (reservation.count === 0) throw new Error("SESSION_FULL");

      const updatedSession = await tx.session.findUnique({
        where:   { id: params.id },
        include: { coach: true },
      });

      if (!updatedSession) throw new Error("SESSION_NOT_FOUND");

      if (updatedSession.spotsTaken >= updatedSession.maxSpots) {
        await tx.session.update({
          where: { id: updatedSession.id },
          data:  { status: "full" },
        });
      }

      const booking = await tx.booking.create({
        data: {
          sessionId:        updatedSession.id,
          participantEmail: email,
          participantName:  name,
          qrToken:          generateQrToken(),
          status:           "pending",
        },
      });

      return { session: updatedSession, booking };
    });

    bookingId = result.booking.id;
    sessionId = result.session.id;

    // ── 2. Créer le PaymentIntent Stripe ─────────────────────────────────────
    // Si Stripe échoue ici, on compense en annulant le booking et libérant la place
    const paymentIntent = await createPaymentIntent({
      amountCents:          result.session.priceCents,
      coachStripeAccountId: result.session.coach.stripeAccountId!,
      coachStripeActive:    result.session.coach.stripeOnboardingStatus === "active",
      metadata: {
        booking_id:  result.booking.id,
        session_id:  result.session.id,
        participant: email,
      },
    });

    // ── 3. Lier le PaymentIntent au Booking ───────────────────────────────────
    await db.booking.update({
      where: { id: result.booking.id },
      data:  { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId:    result.booking.id,
      amountCents:  result.session.priceCents,
    });

  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";

    // ── Compensation : si la DB a été modifiée mais Stripe a échoué ───────────
    const isStripeError = !["SESSION_NOT_FOUND", "SESSION_NOT_AVAILABLE", "SESSION_FULL", "COACH_STRIPE_NOT_CONFIGURED"].includes(code);

    if (isStripeError && bookingId && sessionId) {
      try {
        await db.$transaction([
          db.booking.delete({ where: { id: bookingId } }),
          db.session.update({
            where: { id: sessionId },
            data:  {
              spotsTaken: { decrement: 1 },
              status:     "published",   // réouvre si elle était passée full
            },
          }),
        ]);
        console.error("[Reserve] Stripe failed, DB compensated:", code, err);
      } catch (compensationErr) {
        console.error("[Reserve] Compensation failed:", compensationErr);
      }
    }

    const message = {
      SESSION_NOT_FOUND:           "Session introuvable.",
      SESSION_NOT_AVAILABLE:       "Cette session n'est plus disponible.",
      SESSION_FULL:                "Désolé, il n'y a plus de place disponible.",
      COACH_STRIPE_NOT_CONFIGURED: "Le paiement n'est pas encore activé pour ce coach.",
    }[code] ?? "Une erreur est survenue. Réessaie.";

    const status = code === "SESSION_NOT_FOUND" ? 404
                 : code === "SESSION_FULL"       ? 409
                 : 500;

    console.error("[Reserve] Error:", code, err);
    return NextResponse.json({ error: message, code }, { status });
  }
}
