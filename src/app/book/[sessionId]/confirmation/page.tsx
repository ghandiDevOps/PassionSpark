import { db } from "@/lib/db";
import { QRCodeSVG } from "qrcode.react";
import { ConfirmationPoller } from "@/components/booking/confirmation-poller";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import Link from "next/link";

interface Props {
  searchParams: { booking_id?: string; redirect_status?: string };
}

function InvalidLinkScreen({ reason }: { reason: "missing" | "unknown" | "cancelled" }) {
  const messages = {
    missing:   { title: "LIEN DE CONFIRMATION INCOMPLET", body: "Cette page nécessite un identifiant de réservation. Si tu viens de payer, attends quelques secondes puis réessaie depuis ton email de confirmation." },
    unknown:   { title: "RÉSERVATION INTROUVABLE",       body: "Aucune réservation ne correspond à ce lien. Vérifie l'email de confirmation ou consulte tes billets." },
    cancelled: { title: "RÉSERVATION ANNULÉE",            body: "Cette réservation a été annulée ou n'a jamais été finalisée." },
  };
  const { title, body } = messages[reason];
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-1 h-12 bg-[#FF7A00] mx-auto mb-8" />
      <p className="font-display text-5xl text-[#FF7A00] mb-4">⚠️</p>
      <h1 className="font-display text-2xl sm:text-3xl text-white mb-3 max-w-md">{title}</h1>
      <p className="text-[#888] text-sm font-sans mb-8 max-w-sm">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/my/bookings" className="btn-passion px-8">MES BILLETS</Link>
        <Link href="/explore" className="btn-passion-outline px-8">EXPLORER</Link>
      </div>
    </main>
  );
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const bookingId = searchParams.booking_id;
  if (!bookingId) return <InvalidLinkScreen reason="missing" />;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      session: {
        include: {
          coach: { include: { user: true } },
        },
      },
    },
  });

  if (!booking) return <InvalidLinkScreen reason="unknown" />;

  const isPending   = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed" || booking.status === "attended";
  const stripeOk    = searchParams.redirect_status === "succeeded";

  if (!isConfirmed && !(isPending && stripeOk)) {
    return <InvalidLinkScreen reason="cancelled" />;
  }

  const { session } = booking;

  const icalUrl = generateIcalUrl({
    title:    session.title,
    start:    session.dateStart,
    end:      new Date(session.dateStart.getTime() + session.durationMin * 60000),
    location: session.locationAddress,
  });

  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <div className="page-container pt-10 space-y-8">

        {/* Succès */}
        <div className="text-center space-y-3">
          <div className="text-6xl">🎉</div>
          <h1 className="font-display text-3xl text-white">
            C&apos;est réservé, {booking.participantName} !
          </h1>
          <p className="text-[#888]">
            Ton QR code a été envoyé à{" "}
            <span className="text-white">{booking.participantEmail}</span>
          </p>
        </div>

        {/* QR Code — poller si encore pending, statique si confirmé */}
        {isConfirmed ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <QRCodeSVG
                value={booking.qrToken}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-sm text-[#888] text-center">
              Montre ce QR code à l&apos;entrée
            </p>
          </div>
        ) : (
          <ConfirmationPoller
            bookingId={bookingId}
            participantName={booking.participantName}
          />
        )}

        {/* Récapitulatif */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
          <h2 className="font-display-md text-white">{session.title}</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <span className="text-[#ccc] capitalize">
                {formatSessionDateTime(session.dateStart, session.durationMin)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📍</span>
              <span className="text-[#ccc]">{session.locationAddress}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <span className="text-[#ccc]">
                Coach : {session.coach.user.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">💶</span>
              <span className="text-white font-semibold">
                Payé : {booking.amountPaidCents ? formatPrice(booking.amountPaidCents) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={icalUrl}
            download="passionspark-session.ics"
            className="btn-passion-outline text-center block"
          >
            📅 Ajouter au calendrier
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(session.locationAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-passion-outline text-center block"
          >
            🗺️ Voir sur la carte
          </a>
        </div>

        <p className="text-xs text-center text-[#555]">
          Tu recevras un rappel la veille et 2h avant la session.
        </p>

        <div className="text-center pb-8">
          <Link href="/my/bookings" className="font-display-md text-xs text-[#FF7A00] tracking-widest hover:underline">
            VOIR TOUS MES BILLETS →
          </Link>
        </div>
      </div>
    </main>
  );
}

function generateIcalUrl({
  title,
  start,
  end,
  location,
}: {
  title: string;
  start: Date;
  end: Date;
  location: string;
}) {
  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Passion Spark//FR",
    "BEGIN:VEVENT",
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ical)}`;
}
