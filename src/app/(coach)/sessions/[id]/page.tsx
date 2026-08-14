import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import { APP_URL } from "@/constants";
import { CopyButton } from "@/components/ui/copy-button";
import { StripeConnectButton } from "@/components/coach/stripe-connect-button";

interface Props {
  params: { id: string };
  searchParams: { created?: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `Session · Passion Spark` };
}

export default async function SessionDetailPage({ params, searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const justCreated = searchParams.created === "1";

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) redirect("/onboarding");

  const session = await db.session.findUnique({
    where:   { id: params.id },
    include: {
      bookings: {
        where:   { status: { in: ["confirmed", "attended"] } },
        orderBy: { paidAt: "asc" },
      },
    },
  });

  if (!session) notFound();

  // Ownership check
  if (session.coachId !== user.coachProfile.id) notFound();

  const shareUrl  = `${APP_URL}/s/${session.slug}`;
  const now       = new Date();
  const isPast    = session.dateStart < now;
  const pct       = Math.round(session.spotsTaken / session.maxSpots * 100);
  const left      = session.maxSpots - session.spotsTaken;
  const confirmed = session.bookings.filter((b) => b.status === "confirmed").length;
  const attended  = session.bookings.filter((b) => b.status === "attended").length;
  const gross     = session.priceCents * session.spotsTaken;
  const net       = Math.round(gross * 0.70);

  const stripeActive = user.coachProfile.stripeOnboardingStatus === "active";

  return (
    <div className="px-4 sm:px-6 py-8 space-y-8">

      {/* ── Stripe activation banner ── */}
      {!stripeActive && (
        <div className={`border p-5 space-y-4 ${justCreated ? "border-[#FF7A00]/60 bg-[#FF7A00]/5" : "border-[#2a2a2a] bg-[#1e1e1e]"}`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 border border-[#FF7A00]/40 flex items-center justify-center mt-0.5">
              <span className="text-[#FF7A00] text-sm">💳</span>
            </div>
            <div>
              <p className="font-display-md text-[10px] tracking-[0.2em] text-[#FF7A00] mb-1">
                {justCreated ? "SESSION CRÉÉE — ACTIVE LES PAIEMENTS" : "PAIEMENTS NON ACTIVÉS"}
              </p>
              <p className="text-xs font-sans" style={{ color: "var(--color-muted)" }}>
                {justCreated
                  ? "Ta session est en ligne ! Active maintenant Stripe pour recevoir des paiements dès la première réservation."
                  : "Les participants ne peuvent pas encore réserver. Active Stripe pour recevoir tes revenus."}
              </p>
            </div>
          </div>
          <StripeConnectButton
            incomplete={user.coachProfile.stripeOnboardingStatus === "pending"}
            label="ACTIVER STRIPE ET RECEVOIR VOS PAIEMENTS →"
          />
        </div>
      )}

      {/* ── Back ── */}
      <Link href="/sessions" className="font-display-md text-xs text-[#555] hover:text-[#FF7A00] transition-colors">
        ← SESSIONS
      </Link>

      {/* ── Header ── */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={session.sessionType === "discovery" ? "badge-discover" : "badge-progress"}>
            {session.sessionType === "discovery" ? "DÉCOUVERTE" : "PROGRESSION"}
          </span>
          <span className={`font-display-md text-[10px] px-2 py-1 border ${
            session.status === "full"      ? "border-[#FF3D00]/40 text-[#FF3D00] bg-[#FF3D00]/10" :
            session.status === "published" ? "border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10" :
            session.status === "completed" ? "border-[#555] text-[#555]" :
            "border-[#2a2a2a] text-[#555]"
          }`}>
            {session.status.toUpperCase()}
          </span>
          {isPast && <span className="font-display-md text-[10px] px-2 py-1 border border-[#2a2a2a] text-[#333]">PASSÉE</span>}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-2">
          {session.title}
        </h1>
        <p className="text-[#555] text-sm font-sans capitalize">
          {formatSessionDateTime(session.dateStart, session.durationMin)} · {session.locationAddress}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
          <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-1">INSCRITS</p>
          <p className="font-display text-4xl text-white">{session.spotsTaken}</p>
          <p className="font-sans text-xs text-[#444] mt-1">sur {session.maxSpots} places</p>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
          <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-1">REVENUS NETS</p>
          <p className="font-display text-4xl text-[#FF7A00]">{formatPrice(net)}</p>
          <p className="font-sans text-xs text-[#444] mt-1">{formatPrice(gross)} brut</p>
        </div>
        {isPast ? (
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
            <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-1">PRÉSENTS</p>
            <p className="font-display text-4xl text-white">{attended}</p>
            <p className="font-sans text-xs text-[#444] mt-1">scannés sur {confirmed + attended}</p>
          </div>
        ) : (
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
            <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-1">PLACES LIBRES</p>
            <p className={`font-display text-4xl ${left === 0 ? "text-[#FF3D00]" : "text-white"}`}>{left}</p>
            <p className="font-sans text-xs text-[#444] mt-1">{pct}% rempli</p>
          </div>
        )}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
          <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-1">PRIX / PERS.</p>
          <p className="font-display text-4xl text-[#FF7A00]">{formatPrice(session.priceCents)}</p>
        </div>
      </div>

      {/* ── Barre de remplissage ── */}
      <div>
        <div className="flex justify-between mb-1 text-xs font-sans">
          <span className="text-[#555]">{session.spotsTaken} inscrits</span>
          <span className={left === 0 ? "text-[#FF3D00]" : "text-[#555]"}>
            {left === 0 ? "COMPLET" : `${left} place${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="w-full bg-[#2a2a2a] h-1">
          <div
            className={`h-full transition-all ${left === 0 ? "bg-[#FF3D00]" : "bg-[#FF7A00]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3">
        {!isPast && (
          <Link href={`/sessions/${session.id}/scan`} className="btn-passion px-6">
            SCANNER LES QR CODES →
          </Link>
        )}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-passion-outline px-6"
        >
          VOIR LA PAGE PUBLIQUE
        </a>
      </div>

      {/* ── Lien de partage ── */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4">
        <p className="font-display-md text-[10px] text-[#555] tracking-widest mb-2">LIEN DE PARTAGE</p>
        <div className="flex items-center gap-3">
          <code className="text-[#FF7A00] text-sm font-mono flex-1 truncate">{shareUrl}</code>
          <CopyButton text={shareUrl} />
        </div>
      </div>

      {/* ── Liste des inscrits ── */}
      <div>
        <h2 className="font-display text-2xl text-white mb-4">
          INSCRITS — {session.bookings.length}
        </h2>

        {session.bookings.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-8 text-center">
            <p className="font-display text-4xl text-[#2a2a2a] mb-3">0</p>
            <p className="text-[#555] text-sm font-sans">
              Aucune réservation pour l&apos;instant. Partage le lien !
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {session.bookings.map((booking, i) => (
              <div
                key={booking.id}
                className="bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 flex items-center gap-4"
              >
                <span className="font-display text-lg text-[#2a2a2a] w-6 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display-md text-sm text-white truncate">
                    {booking.participantName}
                  </p>
                  <p className="text-[#555] text-xs font-sans truncate">{booking.participantEmail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`font-display-md text-[10px] px-2 py-1 border ${
                    booking.status === "attended"
                      ? "border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10"
                      : "border-[#2a2a2a] text-[#555]"
                  }`}>
                    {booking.status === "attended" ? "PRÉSENT" : "CONFIRMÉ"}
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

