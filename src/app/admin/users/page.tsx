import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Utilisateurs" };

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; banned?: string; page?: string }>;
}

const ROLE_LABELS: Record<string, string> = {
  participant: "Participant",
  coach: "Coach",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  participant: "text-[#555] bg-[#1a1a1a]",
  coach: "text-blue-400 bg-blue-500/10",
  admin: "text-red-400 bg-red-500/10",
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const roleFilter = params.role || "";
  const bannedFilter = params.banned || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 25;

  const where = {
    deletedAt: null,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(roleFilter && { role: roleFilter as "coach" | "participant" | "admin" }),
    ...(bannedFilter === "banned" && { bannedAt: { not: null } }),
    ...(bannedFilter === "active" && { bannedAt: null }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bannedAt: true,
        bannedReason: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (roleFilter) p.set("role", roleFilter);
    if (bannedFilter) p.set("banned", bannedFilter);
    if (page !== 1) p.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    const s = p.toString();
    return `/admin/users${s ? "?" + s : ""}`;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-white">UTILISATEURS</h1>
          <p className="text-[#444] text-sm font-sans mt-1">{total} compte{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nom ou email…"
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-white placeholder-[#333] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40 w-48"
        />
        <select
          name="role"
          defaultValue={roleFilter}
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-[#aaa] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40"
        >
          <option value="">Tous les rôles</option>
          <option value="participant">Participants</option>
          <option value="coach">Coachs</option>
          <option value="admin">Admins</option>
        </select>
        <select
          name="banned"
          defaultValue={bannedFilter}
          className="bg-[#0d0d0d] border border-[#1e1e1e] text-[#aaa] text-sm font-sans px-3 py-1.5 rounded focus:outline-none focus:border-[#FF7A00]/40"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="banned">Bannis</option>
        </select>
        <button
          type="submit"
          className="bg-[#FF7A00] text-black font-display-md text-[10px] tracking-wider px-4 py-1.5 hover:bg-[#FF9A30] transition-colors"
        >
          FILTRER
        </button>
        {(q || roleFilter || bannedFilter) && (
          <Link
            href="/admin/users"
            className="text-[#444] text-sm font-sans px-3 py-1.5 hover:text-white transition-colors"
          >
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
                {["NOM", "EMAIL", "RÔLE", "RÉSERVATIONS", "INSCRIT LE", "STATUT", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left font-display-md text-[10px] tracking-wider text-[#333] px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-[#333] text-center">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`${i !== 0 ? "border-t border-[#111]" : ""} hover:bg-[#0f0f0f] transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <span className={`text-white font-sans ${user.bannedAt ? "line-through opacity-40" : ""}`}>
                        {user.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`font-display-md text-[10px] tracking-wider px-2 py-0.5 ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555]">{user._count.bookings}</td>
                    <td className="px-4 py-3 text-[#444]">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {user.bannedAt ? (
                        <span className="font-display-md text-[10px] tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5">
                          BANNI
                        </span>
                      ) : (
                        <span className="font-display-md text-[10px] tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5">
                          ACTIF
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-display-md text-[10px] tracking-wider text-[#FF7A00] hover:text-[#FF9A30] transition-colors"
                      >
                        GÉRER →
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
          <span className="text-[#444] text-xs font-sans">
            Page {page} / {totalPages}
          </span>
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
