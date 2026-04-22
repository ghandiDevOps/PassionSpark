import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserActions } from "./user-actions";

export const metadata = { title: "Profil utilisateur" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bannedAt: true,
      bannedReason: true,
      createdAt: true,
      coachProfile: {
        select: {
          bio: true,
          avgRating: true,
          totalSessions: true,
          totalParticipants: true,
          stripeOnboardingStatus: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          amountPaidCents: true,
          createdAt: true,
          session: { select: { title: true, slug: true } },
        },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!user) notFound();

  const totalSpent = user.bookings.reduce(
    (acc, b) => acc + (b.amountPaidCents ?? 0),
    0
  );

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "text-yellow-400" },
    confirmed: { label: "Confirmée", color: "text-green-400" },
    attended: { label: "Présent", color: "text-blue-400" },
    no_show: { label: "Absent", color: "text-[#555]" },
    cancelled: { label: "Annulée", color: "text-red-400" },
  };

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#444] text-xs font-sans">
        <Link href="/admin/users" className="hover:text-white transition-colors">Utilisateurs</Link>
        <span>›</span>
        <span className="text-white">{user.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl text-white">{user.name.toUpperCase()}</h1>
            {user.bannedAt && (
              <span className="font-display-md text-[10px] tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5">
                BANNI
              </span>
            )}
          </div>
          <p className="text-[#555] text-sm font-sans">{user.email}</p>
          <p className="text-[#333] text-xs font-sans mt-1">
            Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <UserActions user={{ id: user.id, role: user.role, bannedAt: user.bannedAt, bannedReason: user.bannedReason }} />

      {/* Infos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">RÔLE</p>
          <p className="text-white mt-1 font-sans capitalize">{user.role}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">RÉSERVATIONS</p>
          <p className="text-white mt-1 font-display text-xl">{user._count.bookings}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
          <p className="font-display-md text-[10px] tracking-wider text-[#333]">DÉPENSÉ</p>
          <p className="text-white mt-1 font-display text-xl">{formatEur(totalSpent)}</p>
        </div>
        {user.coachProfile && (
          <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-4">
            <p className="font-display-md text-[10px] tracking-wider text-[#333]">NOTE COACH</p>
            <p className="text-white mt-1 font-display text-xl">{user.coachProfile.avgRating.toFixed(1)}</p>
          </div>
        )}
      </div>

      {/* Profil coach */}
      {user.coachProfile && (
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5">
          <h2 className="font-display-md text-[10px] tracking-wider text-[#444] mb-3">PROFIL COACH</h2>
          <div className="grid grid-cols-3 gap-4 text-sm font-sans">
            <div>
              <p className="text-[#333] text-xs">Sessions</p>
              <p className="text-white">{user.coachProfile.totalSessions}</p>
            </div>
            <div>
              <p className="text-[#333] text-xs">Participants</p>
              <p className="text-white">{user.coachProfile.totalParticipants}</p>
            </div>
            <div>
              <p className="text-[#333] text-xs">Stripe</p>
              <p className={`capitalize ${user.coachProfile.stripeOnboardingStatus === "restricted" ? "text-red-400" : user.coachProfile.stripeOnboardingStatus === "active" ? "text-green-400" : "text-[#555]"}`}>
                {user.coachProfile.stripeOnboardingStatus.replace("_", " ")}
              </p>
            </div>
          </div>
          {user.coachProfile.bio && (
            <p className="text-[#555] text-sm mt-3 font-sans">{user.coachProfile.bio}</p>
          )}
        </div>
      )}

      {/* Réservations récentes */}
      <div>
        <h2 className="font-display-md text-[10px] tracking-wider text-[#444] mb-3">
          RÉSERVATIONS RÉCENTES {user._count.bookings > 10 && `(10 / ${user._count.bookings})`}
        </h2>
        {user.bookings.length === 0 ? (
          <p className="text-[#333] text-sm font-sans">Aucune réservation.</p>
        ) : (
          <div className="border border-[#1a1a1a] rounded overflow-hidden">
            {user.bookings.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-[#111]" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-sans truncate">{b.session.title}</p>
                  <p className="text-[#333] text-xs mt-0.5">
                    {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {b.amountPaidCents && (
                    <span className="text-[#555] text-sm font-sans">{formatEur(b.amountPaidCents)}</span>
                  )}
                  <span className={`font-display-md text-[10px] tracking-wider ${BOOKING_STATUS_LABELS[b.status]?.color ?? "text-[#555]"}`}>
                    {BOOKING_STATUS_LABELS[b.status]?.label ?? b.status}
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
