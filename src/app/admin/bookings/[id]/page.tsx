import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingActions } from "./booking-actions";

export const metadata = { title: "Réservation — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    select: {
      id: true,
      participantName: true,
      participantEmail: true,
      status: true,
      amountPaidCents: true,
      stripePaymentIntentId: true,
      stripeChargeId: true,
      paidAt: true,
      scannedAt: true,
      cancelledAt: true,
      cancellationBy: true,
      refundedAt: true,
      createdAt: true,
      qrToken: true,
      session: {
        select: {
          id: true,
          title: true,
          slug: true,
          dateStart: true,
          locationAddress: true,
          priceCents: true,
          coach: { select: { user: { select: { name: true, email: true } } } },
        },
      },
    },
  });

  if (!booking) notFound();

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  const STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-400",
    confirmed: "text-green-400",
    attended: "text-blue-400",
    no_show: "text-[#555]",
    cancelled: "text-red-400",
  };

  const canRefund =
    ["confirmed", "attended", "cancelled"].includes(booking.status) &&
    !booking.refundedAt &&
    !!booking.stripePaymentIntentId;

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#444] text-xs font-sans">
        <Link href="/admin/bookings" className="hover:text-white transition-colors">Réservations</Link>
        <span>›</span>
        <span className="text-white">{booking.participantName}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-2xl text-white">{booking.participantName.toUpperCase()}</h1>
          <span className={`font-display-md text-[10px] tracking-wider border border-current/20 px-2 py-0.5 ${STATUS_COLORS[booking.status] ?? "text-[#555]"}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>
        <p className="text-[#555] text-sm font-sans">{booking.participantEmail}</p>
      </div>

      {/* Actions */}
      {canRefund && (
        <BookingActions booking={{ id: booking.id, amountPaidCents: booking.amountPaidCents }} />
      )}

      {/* Infos réservation */}
      <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 space-y-4">
        <h2 className="font-display-md text-[10px] tracking-wider text-[#444]">DÉTAILS</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm font-sans">
          <div>
            <p className="text-[#333] text-xs mb-0.5">Montant payé</p>
            <p className="text-white">{booking.amountPaidCents ? formatEur(booking.amountPaidCents) : "—"}</p>
          </div>
          <div>
            <p className="text-[#333] text-xs mb-0.5">Date de réservation</p>
            <p className="text-white">{new Date(booking.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {booking.paidAt && (
            <div>
              <p className="text-[#333] text-xs mb-0.5">Paiement confirmé</p>
              <p className="text-white">{new Date(booking.paidAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          )}
          {booking.scannedAt && (
            <div>
              <p className="text-[#333] text-xs mb-0.5">QR scanné le</p>
              <p className="text-blue-400">{new Date(booking.scannedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          )}
          {booking.cancelledAt && (
            <div>
              <p className="text-[#333] text-xs mb-0.5">Annulé le</p>
              <p className="text-red-400">{new Date(booking.cancelledAt).toLocaleDateString("fr-FR")} ({booking.cancellationBy ?? "?"})</p>
            </div>
          )}
          {booking.refundedAt && (
            <div>
              <p className="text-[#333] text-xs mb-0.5">Remboursé le</p>
              <p className="text-green-400">{new Date(booking.refundedAt).toLocaleDateString("fr-FR")}</p>
            </div>
          )}
          {booking.stripePaymentIntentId && (
            <div className="sm:col-span-2">
              <p className="text-[#333] text-xs mb-0.5">Payment Intent Stripe</p>
              <p className="text-[#444] font-mono text-xs">{booking.stripePaymentIntentId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Session liée */}
      <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 space-y-3">
        <h2 className="font-display-md text-[10px] tracking-wider text-[#444]">SESSION</h2>
        <p className="text-white font-sans">{booking.session.title}</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm font-sans">
          <div>
            <p className="text-[#333] text-xs mb-0.5">Coach</p>
            <p className="text-[#888]">{booking.session.coach.user.name}</p>
          </div>
          <div>
            <p className="text-[#333] text-xs mb-0.5">Date</p>
            <p className="text-[#888]">{new Date(booking.session.dateStart).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div>
            <p className="text-[#333] text-xs mb-0.5">Lieu</p>
            <p className="text-[#888]">{booking.session.locationAddress}</p>
          </div>
          <div>
            <p className="text-[#333] text-xs mb-0.5">Prix catalogue</p>
            <p className="text-[#888]">{formatEur(booking.session.priceCents)}</p>
          </div>
        </div>
        <Link
          href={`/admin/sessions/${booking.session.id}`}
          className="font-display-md text-[10px] tracking-wider text-[#FF7A00] hover:text-[#FF9A30] transition-colors"
        >
          VOIR LA SESSION →
        </Link>
      </div>

    </div>
  );
}
