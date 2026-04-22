import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Réservations" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "text-yellow-400 bg-yellow-500/10",
  confirmed: "text-green-400 bg-green-500/10",
  attended:  "text-blue-400 bg-blue-500/10",
  no_show:   "text-[#555] bg-[#1a1a1a]",
  cancelled: "text-red-400 bg-red-500/10",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  attended: "Présent",
  no_show: "Absent",
  cancelled: "Annulée",
};

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const statusFilter = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 25;

  const where = {
    ...(q && {
      OR: [
        { participantEmail: { contains: q, mode: "insensitive" as const } },
        { participantName: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(statusFilter && { status: statusFilter as "pending" | "confirmed" | "attended" | "no_show" | "cancelled" }),
  };

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        participantName: true,
        participantEmail: true,
        status: true,
        amountPaidCents: true,
        refundedAt: true,
        cancelledAt: true,
        createdAt: true,
        stripePaymentIntentId: true,
        session: { select: { title: true, id: true } },
      },
    }),
    db.booking.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (statusFilter) p.set("status", statusFilter);
    if (page !== 1) p.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    const s = p.toString();
    return `/admin/bookings${s ? "?" + s : ""}`;
  }

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white">RÉSERVATIONS</h1>
        <p className="text-[#444] text-sm font-sans mt-1">{total} réservation{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Email ou nom…"
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-white placeholder-[#333] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40 w-48"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-[#aaa] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#FF7A00] text-black font-display-md text-[10px] tracking-wider px-4 py-1.5 hover:bg-[#FF9A30] transition-colors"
        >
          FILTRER
        </button>
        {(q || statusFilter) && (
          <Link href="/admin/bookings" className="text-[#444] text-sm font-sans px-3 py-1.5 hover:text-white transition-colors">
            Effacer
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="border border-[#1a1a1a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                {["PARTICIPANT", "SESSION", "MONTANT", "DATE", "STATUT", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left font-display-md text-[10px] tracking-wider text-[#333] px-4 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-[#333] text-center">
                    Aucune réservation trouvée.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, i) => (
                  <tr
                    key={booking.id}
                    className={`${i !== 0 ? "border-t border-[#111]" : ""} hover:bg-[#0f0f0f] transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-sans">{booking.participantName}</p>
                      <p className="text-[#444] text-xs">{booking.participantEmail}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <Link
                        href={`/admin/sessions/${booking.session.id}`}
                        className="text-[#888] hover:text-white font-sans truncate block transition-colors"
                      >
                        {booking.session.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#555]">
                      {booking.amountPaidCents ? formatEur(booking.amountPaidCents) : "—"}
                      {booking.refundedAt && (
                        <span className="ml-1 font-display-md text-[9px] tracking-wider text-red-400">REMB.</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#444] whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-display-md text-[10px] tracking-wider px-2 py-0.5 ${STATUS_COLORS[booking.status]}`}>
                        {(STATUS_LABELS[booking.status] ?? booking.status).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="font-display-md text-[10px] tracking-wider text-[#FF7A00] hover:text-[#FF9A30] transition-colors"
                      >
                        DÉTAIL →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="font-display-md text-[10px] tracking-wider text-[#555] hover:text-white border border-[#1e1e1e] px-3 py-1.5 transition-colors"
            >
              ← PRÉC
            </Link>
          )}
          <span className="text-[#444] text-xs font-sans">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="font-display-md text-[10px] tracking-wider text-[#555] hover:text-white border border-[#1e1e1e] px-3 py-1.5 transition-colors"
            >
              SUIV →
            </Link>
          )}
        </div>
      )}

    </div>
  );
}
