import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Sessions" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; domain?: string; page?: string }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:      { label: "Brouillon",  color: "text-[#555] bg-[#1a1a1a]" },
  published:  { label: "Publiée",    color: "text-green-400 bg-green-500/10" },
  full:       { label: "Complète",   color: "text-blue-400 bg-blue-500/10" },
  completed:  { label: "Terminée",   color: "text-[#444] bg-[#111]" },
  cancelled:  { label: "Annulée",    color: "text-red-400 bg-red-500/10" },
};

const DOMAIN_LABELS: Record<string, string> = {
  sport: "Sport",
  music: "Musique",
  cooking: "Cuisine",
  language: "Langue",
  business: "Business",
  art: "Art",
  other: "Autre",
};

export default async function AdminSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const statusFilter = params.status || "";
  const domainFilter = params.domain || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 25;

  const where = {
    ...(q && { title: { contains: q, mode: "insensitive" as const } }),
    ...(statusFilter && { status: statusFilter as "draft" | "published" | "full" | "completed" | "cancelled" }),
    ...(domainFilter && { domain: domainFilter as "sport" | "music" | "cooking" | "language" | "business" | "art" | "other" }),
  };

  const [sessions, total] = await Promise.all([
    db.session.findMany({
      where,
      orderBy: { dateStart: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        domain: true,
        dateStart: true,
        priceCents: true,
        spotsTaken: true,
        maxSpots: true,
        coach: {
          select: { user: { select: { name: true } } },
        },
        _count: { select: { bookings: true } },
      },
    }),
    db.session.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (statusFilter) p.set("status", statusFilter);
    if (domainFilter) p.set("domain", domainFilter);
    if (page !== 1) p.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    const s = p.toString();
    return `/admin/sessions${s ? "?" + s : ""}`;
  }

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white">SESSIONS</h1>
        <p className="text-[#444] text-sm font-sans mt-1">{total} session{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Titre…"
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-white placeholder-[#333] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40 w-48"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-[#aaa] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          name="domain"
          defaultValue={domainFilter}
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-[#aaa] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40"
        >
          <option value="">Tous les domaines</option>
          {Object.entries(DOMAIN_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#FF7A00] text-black font-display-md text-[10px] tracking-wider px-4 py-1.5 hover:bg-[#FF9A30] transition-colors"
        >
          FILTRER
        </button>
        {(q || statusFilter || domainFilter) && (
          <Link href="/admin/sessions" className="text-[#444] text-sm font-sans px-3 py-1.5 hover:text-white transition-colors">
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
                {["TITRE", "COACH", "DOMAINE", "DATE", "PRIX", "PLACES", "STATUT", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left font-display-md text-[10px] tracking-wider text-[#333] px-4 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-[#333] text-center">
                    Aucune session trouvée.
                  </td>
                </tr>
              ) : (
                sessions.map((session, i) => {
                  const st = STATUS_LABELS[session.status] ?? { label: session.status, color: "text-[#555]" };
                  return (
                    <tr
                      key={session.id}
                      className={`${i !== 0 ? "border-t border-[#111]" : ""} hover:bg-[#0f0f0f] transition-colors`}
                    >
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="text-white font-sans truncate block">{session.title}</span>
                      </td>
                      <td className="px-4 py-3 text-[#555] whitespace-nowrap">{session.coach.user.name}</td>
                      <td className="px-4 py-3 text-[#555] capitalize">{DOMAIN_LABELS[session.domain] ?? session.domain}</td>
                      <td className="px-4 py-3 text-[#444] whitespace-nowrap">
                        {new Date(session.dateStart).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-[#555]">{formatEur(session.priceCents)}</td>
                      <td className="px-4 py-3 text-[#555]">
                        {session.spotsTaken}/{session.maxSpots}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-display-md text-[10px] tracking-wider px-2 py-0.5 ${st.color}`}>
                          {st.label.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/sessions/${session.id}`}
                          className="font-display-md text-[10px] tracking-wider text-[#FF7A00] hover:text-[#FF9A30] transition-colors"
                        >
                          GÉRER →
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
