import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SessionActions } from "./session-actions";

export const metadata = { title: "Session — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:      { label: "Brouillon",  color: "text-[#555]" },
  published:  { label: "Publiée",    color: "text-green-400" },
  full:       { label: "Complète",   color: "text-blue-400" },
  completed:  { label: "Terminée",   color: "text-[#444]" },
  cancelled:  { label: "Annulée",    color: "text-red-400" },
};

export default async function AdminSessionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await db.session.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      domain: true,
      sessionType: true,
      category: true,
      dateStart: true,
      durationMin: true,
      locationAddress: true,
      priceCents: true,
      maxSpots: true,
      spotsTaken: true,
      cancellationReason: true,
      createdAt: true,
      coach: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          participantName: true,
          participantEmail: true,
          status: true,
          amountPaidCents: true,
          createdAt: true,
        },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!session) notFound();

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  const gmv = session.bookings
    .filter((b) => ["confirmed", "attended"].includes(b.status))
    .reduce((acc, b) => acc + (b.amountPaidCents ?? 0), 0);

  const st = STATUS_LABELS[session.status] ?? { label: session.status, color: "text-[#555]" };

  const BOOKING_STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-400",
    confirmed: "text-green-400",
    attended: "text-blue-400",
    no_show: "text-[#555]",
    cancelled: "text-red-400",
  };

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#444] text-xs font-sans">
        <Link href="/admin/sessions" className="hover:text-white transition-colors">Sessions</Link>
        <span>›</span>
        <span className="text-white truncate max-w-xs">{session.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="font-display text-2xl text-white">{session.title.toUpperCase()}</h1>
          <span className={`font-display-md text-[10px] tracking-wider ${st.color} border border-current/20 px-2 py-0.5`}>
            {st.label.toUpperCase()}
          </span>
        </div>
        <p className="text-[#555] text-sm font-sans">
          Coach : <span className="text-[#888]">{session.coach.user.name}</span>
          {" · "}
          {new Date(session.dateStart).toLocaleDateString("fr-FR", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <SessionActions session={{ id: session.id, status: session.status, cancellationReason: session.cancellationReason }} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">PRIX</p>
          <p className="text-white font-display text-xl mt-1">{formatEur(session.priceCents)}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">PLACES</p>
          <p className="text-white font-display text-xl mt-1">{session.spotsTaken}/{session.maxSpots}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">RÉSERVATIONS</p>
          <p className="text-white font-display text-xl mt-1">{session._count.bookings}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">REVENUS</p>
          <p className="text-white font-display text-xl mt-1">{formatEur(gmv)}</p>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 grid sm:grid-cols-2 gap-4 text-sm font-sans">
        <div>
          <p className="text-[#333] text-xs mb-0.5">Domaine</p>
          <p className="text-white capitalize">{session.domain}</p>
        </div>
        <div>
          <p className="text-[#333] text-xs mb-0.5">Type</p>
          <p className="text-white capitalize">{session.sessionType}</p>
        </div>
        <div>
          <p className="text-[#333] text-xs mb-0.5">Durée</p>
          <p className="text-white">{session.durationMin} min</p>
        </div>
        <div>
          <p className="text-[#333] text-xs mb-0.5">Lieu</p>
          <p className="text-white">{session.locationAddress}</p>
        </div>
        {session.cancellationReason && (
          <div className="sm:col-span-2">
            <p className="text-[#333] text-xs mb-0.5">Raison d'annulation</p>
            <p className="text-red-400">{session.cancellationReason}</p>
          </div>
        )}
      </div>

      {/* Lien public */}
      <div>
        <Link
          href={`/s/${session.slug}`}
          target="_blank"
          className="font-display-md text-[10px] tracking-wider text-[#FF7A00] hover:text-[#FF9A30] transition-colors"
        >
          VOIR LA PAGE PUBLIQUE →
        </Link>
      </div>

      {/* Réservations */}
      <div>
        <h2 className="font-display-md text-[10px] tracking-wider text-[#444] mb-3">
          RÉSERVATIONS {session._count.bookings > 20 && `(20 / ${session._count.bookings})`}
        </h2>
        {session.bookings.length === 0 ? (
          <p className="text-[#333] text-sm font-sans">Aucune réservation.</p>
        ) : (
          <div className="border border-[#1a1a1a] rounded overflow-hidden">
            {session.bookings.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-[#111]" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-sans">{b.participantName}</p>
                  <p className="text-[#333] text-xs">{b.participantEmail}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {b.amountPaidCents && (
                    <span className="text-[#555] text-sm font-sans">{formatEur(b.amountPaidCents)}</span>
                  )}
                  <span className={`font-display-md text-[10px] tracking-wider ${BOOKING_STATUS_COLORS[b.status] ?? "text-[#555]"}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
