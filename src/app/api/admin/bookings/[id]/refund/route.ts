import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { stripe } from "@/lib/stripe";

async function getAdminUser(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const admin = await getAdminUser(clerkId);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: bookingId } = await params;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      stripePaymentIntentId: true,
      stripeChargeId: true,
      amountPaidCents: true,
      refundedAt: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "BOOKING_NOT_FOUND" }, { status: 404 });
  if (booking.refundedAt) return NextResponse.json({ error: "ALREADY_REFUNDED" }, { status: 409 });
  if (!booking.stripePaymentIntentId) return NextResponse.json({ error: "NO_PAYMENT_INTENT" }, { status: 422 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  try {
    // Récupérer le charge ID depuis le payment intent si non stocké
    let chargeId = booking.stripeChargeId;
    if (!chargeId) {
      const pi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      chargeId = typeof pi.latest_charge === "string" ? pi.latest_charge : (pi.latest_charge?.id ?? null);
    }

    if (!chargeId) {
      return NextResponse.json({ error: "NO_CHARGE_FOUND" }, { status: 422 });
    }

    // Créer le remboursement Stripe.
    // idempotencyKey = bookingId : double-clic admin ou retry réseau ne
    // crée pas deux Refund objects distincts (Stripe déduplique côté API).
    await stripe.refunds.create(
      {
        charge: chargeId,
        reason: "requested_by_customer",
      },
      { idempotencyKey: `refund:${bookingId}` },
    );

    // Marquer en base
    await db.booking.update({
      where: { id: bookingId },
      data: {
        refundedAt: new Date(),
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationBy: "system",
      },
    });

    await logAudit({
      adminId: admin.id,
      action: "REFUND_BOOKING",
      targetType: "booking",
      targetId: bookingId,
      metadata: { amountCents: booking.amountPaidCents, chargeId },
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Ne pas renvoyer err.message au client : les messages Stripe peuvent
    // contenir des IDs internes, des paramètres de request, etc. Log complet
    // côté serveur seulement.
    console.error("[Admin] Refund failed:", err);
    return NextResponse.json({ error: "STRIPE_ERROR" }, { status: 500 });
  }
}
