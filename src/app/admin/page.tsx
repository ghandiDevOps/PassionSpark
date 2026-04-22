import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const [
    totalUsers,
    totalCoaches,
    bannedUsers,
    totalSessions,
    publishedSessions,
    totalBookings,
    confirmedBookings,
    revenueResult,
    recentAuditLogs,
    restrictedCoaches,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { role: "coach", deletedAt: null } }),
    db.user.count({ where: { bannedAt: { not: null }, deletedAt: null } }),
    db.session.count(),
    db.session.count({ where: { status: "published" } }),
    db.booking.count(),
    db.booking.count({ where: { status: "confirmed" } }),
    db.booking.aggregate({
      where: { status: { in: ["confirmed", "attended"] } },
      _sum: { amountPaidCents: true },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { admin: { select: { name: true } } },
    }),
    db.coachProfile.count({
      where: { stripeOnboardingStatus: "restricted" },
    }),
  ]);

  const gmvCents = revenueResult._sum.amountPaidCents ?? 0;
  const commissionCents = Math.round(gmvCents * 0.23);

  return {
    totalUsers,
    totalCoaches,
    bannedUsers,
    totalSessions,
    publishedSessions,
    totalBookings,
    confirmedBookings,
    gmvCents,
    commissionCents,
    recentAuditLogs,
    restrictedCoaches,
  };
}

function StatCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-[#0d0d0d] border rounded p-4 ${alert ? "border-red-500/40" : "border-[#1e1e1e]"}`}>
      <p className="font-display-md text-[10px] tracking-wider text-[#444] mb-1">{label}</p>
      <p className={`font-display text-2xl leading-none ${alert ? "text-red-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#444] mt-1 font-sans">{sub}</p>}
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  BAN_USER: "Ban",
  UNBAN_USER: "Unban",
  CHANGE_ROLE: "Rôle modifié",
  CANCEL_SESSION: "Session annulée",
  UNPUBLISH_SESSION: "Session dépubliée",
  REFUND_BOOKING: "Remboursement",
  DELETE_REVIEW: "Avis supprimé",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white">DASHBOARD</h1>
        <p className="text-[#444] text-sm font-sans mt-1">Vue d'ensemble Passion Spark</p>
      </div>

      {/* Alertes */}
      {(stats.bannedUsers > 0 || stats.restrictedCoaches > 0) && (
        <div className="space-y-2">
          {stats.restrictedCoaches > 0 && (
            <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-red-400 text-sm font-sans">
                {stats.restrictedCoaches} coach{stats.restrictedCoaches > 1 ? "s" : ""} avec compte Stripe restreint
              </span>
            </div>
          )}
          {stats.bannedUsers > 0 && (
            <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <span className="text-yellow-400 text-sm font-sans">
                {stats.bannedUsers} utilisateur{stats.bannedUsers > 1 ? "s" : ""} banni{stats.bannedUsers > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="UTILISATEURS" value={stats.totalUsers} sub={`${stats.totalCoaches} coachs`} />
        <StatCard label="SESSIONS" value={stats.totalSessions} sub={`${stats.publishedSessions} publiées`} />
        <StatCard label="RÉSERVATIONS" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmées`} />
        <StatCard label="GMV" value={formatEur(stats.gmvCents)} sub={`Commission: ${formatEur(stats.commissionCents)}`} />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/admin/users", label: "GÉRER LES UTILISATEURS", desc: `${stats.totalUsers} comptes` },
          { href: "/admin/sessions", label: "MODÉRER LES SESSIONS", desc: `${stats.publishedSessions} actives` },
          { href: "/admin/bookings", label: "VOIR LES RÉSERVATIONS", desc: `${stats.confirmedBookings} confirmées` },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#FF7A00]/30 rounded p-4 transition-colors"
          >
            <p className="font-display-md text-[11px] tracking-wider text-[#FF7A00] group-hover:text-[#FF9A30] transition-colors">{item.label}</p>
            <p className="text-[#555] text-xs font-sans mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Audit log récent */}
      <div>
        <h2 className="font-display-md text-[11px] tracking-wider text-[#444] mb-3">ACTIVITÉ RÉCENTE</h2>
        {stats.recentAuditLogs.length === 0 ? (
          <p className="text-[#333] text-sm font-sans">Aucune action admin enregistrée.</p>
        ) : (
          <div className="border border-[#1a1a1a] rounded overflow-hidden">
            {stats.recentAuditLogs.map((log, i) => (
              <div
                key={log.id}
                className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display-md text-[10px] tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 shrink-0">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  <span className="text-[#555] text-xs font-sans truncate">
                    {log.targetType} · {log.targetId.slice(0, 8)}…
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[#333] text-[11px] font-sans">{log.admin.name}</span>
                  <span className="text-[#2a2a2a] text-[11px] font-sans">
                    {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
