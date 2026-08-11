import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import { generateQrToken } from "@/lib/utils/generate-qr-token";
import { addMinutes, subHours, subDays, set } from "date-fns";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Défense en profondeur : un secret webhook est déjà lié à un mode (test/live),
  // donc une mauvaise signature filtre déjà le cross-mode — mais si un secret
  // test venait à être réutilisé par erreur en prod, cette assertion refuse
  // explicitement les events test-mode en production.
  const expectedLive = process.env.NODE_ENV === "production";
  if (event.livemode !== expectedLive) {
    console.error(`[Stripe Webhook] livemode mismatch: got ${event.livemode}, expected ${expectedLive}`);
    return NextResponse.json({ error: "MODE_MISMATCH" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Paiement confirmé ─────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(pi);
        break;
      }

      // ── Remboursement ─────────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      // ── Stripe Connect : compte mis à jour ────────────────────────────────
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error (${event.type}):`, err);
    // Retourner 500 → Stripe retente automatiquement
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const bookingId = pi.metadata?.booking_id;
  if (!bookingId) return;

  // FIX #6 — Idempotence stricte : on ne traite que les bookings "pending"
  // Un booking "confirmed" ou "attended" ne doit jamais être re-traité
  const existing = await db.booking.findUnique({ where: { id: bookingId } });
  if (!existing || existing.status !== "pending") return;

  await db.$transaction(async (tx) => {
    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : (pi as any).charges?.data?.[0]?.id;

    if (!chargeId) {
      throw new Error("MISSING_CHARGE_ID");
    }

    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status:                 "confirmed",
        stripeChargeId:         chargeId,
        amountPaidCents:        pi.amount_received,
        paidAt:                 new Date(),
        qrToken:                generateQrToken(),
      },
    });

    const session = await tx.session.findUnique({
      where: { id: booking.sessionId },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    // FIX #5 — Date mutation : on crée une nouvelle Date immutable
    // new Date(dateStart.setHours(...)) mutait l'objet original
    const dateStart   = new Date(session.dateStart);
    const dateAt18h   = set(new Date(dateStart), { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    const reminderD1  = subDays(dateAt18h, 1);
    const reminderH2  = subHours(dateStart, 2);
    const postSession = addMinutes(dateStart, session.durationMin + 120);

    await tx.notification.createMany({
      data: [
        {
          recipientEmail: booking.participantEmail,
          type:           "booking_reminder_d1",
          channel:        "email",
          subject:        `Demain, tu vis ta session ! 🎯`,
          body:           JSON.stringify({ bookingId: booking.id }),
          scheduledAt:    reminderD1,
        },
        {
          recipientEmail: booking.participantEmail,
          type:           "booking_reminder_h2",
          channel:        "email",
          subject:        `Dans 2h, ça commence ! Voici ton QR code 🔥`,
          body:           JSON.stringify({ bookingId: booking.id }),
          scheduledAt:    reminderH2,
        },
        {
          recipientEmail: booking.participantEmail,
          type:           "session_post_review",
          channel:        "email",
          subject:        `Alors, c'était comment ? ⭐`,
          body:           JSON.stringify({ bookingId: booking.id }),
          scheduledAt:    postSession,
        },
      ],
      skipDuplicates: true,
    });
  });

  console.log(`[Stripe] Booking ${bookingId} confirmed`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  const booking = await db.booking.findFirst({
    where: { stripePaymentIntentId: charge.payment_intent as string },
  });

  // FIX #4 — Transaction complète (fichier était tronqué)
  if (!booking || booking.status === "cancelled") return;

  const session = await db.session.findUnique({
    where: { id: booking.sessionId },
  });

  const now = new Date();

  // Annulation uniquement si la session n'a pas encore eu lieu
  if (session && booking.status === "confirmed" && session.dateStart > now) {
    const sessionUpdateData: Record<string, unknown> = {
      spotsTaken: { decrement: 1 },
    };

    // Réouvrir la session si elle était "full"
    if (session.status === "full" && session.spotsTaken - 1 < session.maxSpots) {
      sessionUpdateData.status = "published";
    }

    await db.$transaction([
      db.booking.update({
        where: { id: booking.id },
        data:  { status: "cancelled" },
      }),
      db.session.update({
        where: { id: session.id },
        data:  sessionUpdateData,
      }),
    ]);

    console.log(`[Stripe] Booking ${booking.id} cancelled via refund`);
  } else {
    // Session déjà passée : on annule juste le booking sans toucher aux places
    await db.booking.update({
      where: { id: booking.id },
      data:  { status: "cancelled" },
    });
    console.log(`[Stripe] Booking ${booking.id} cancelled (post-session refund)`);
  }
}

// FIX #3 — Fonction manquante : active le coach quand Stripe Connect est complet
async function handleAccountUpdated(account: Stripe.Account) {
  // charges_enabled = true → le coach peut recevoir des paiements
  const isActive =
    account.charges_enabled &&
    account.details_submitted &&
    !account.requirements?.currently_due?.length;

  if (!isActive) return;

  // Mettre à jour le statut du coach dans la base
  const coach = await db.coachProfile.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!coach) {
    console.warn(`[Stripe] account.updated: no coach found for account ${account.id}`);
    return;
  }

  if (coach.stripeOnboardingStatus === "active") return; // Déjà activé, idempotence

  await db.coachProfile.update({
    where: { id: coach.id },
    data:  { stripeOnboardingStatus: "active" },
  });

  console.log(`[Stripe] Coach ${coach.id} Stripe Connect activated`);
}
