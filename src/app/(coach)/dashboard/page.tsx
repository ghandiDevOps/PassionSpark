import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import { StripeConnectButton } from "@/components/coach/stripe-connect-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Passion Spark" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function countdown(date: Date, now: Date): string {
  const ms = date.getTime() - now.getTime();
  if (ms <= 0) return "Maintenant";
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(ms / 86_400_000);
  if (h < 2)  return "Très bientôt";
  if (h < 24) return `Dans ${h}h`;
  if (d === 1) return "Demain";
  if (d < 7)  return `Dans ${d} jours`;
  const w = Math.floor(d / 7);
  return `Dans ${w} semaine${w > 1 ? "s" : ""}`;
}

function fillColor(pct: number): string {
  if (pct >= 100) return "#FF3D00";
  if (pct >= 75)  return "#FF7A00";
  if (pct >= 40)  return "#FFB700";
  return "#10b981";
}

function startOfMonth(now: Date): Date {
  const d = new Date(now);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });
  if (!user?.coachProfile) redirect("/onboarding");

  const cp  = user.coachProfile;
  const now = new Date();
  const som = startOfMonth(now);
  const lom = new Date(som); lom.setMonth(lom.getMonth() - 1);

  const [
    upcomingSessions,
    revenueThisMonth,
    revenueLastMonth,
    revenueTotal,
    pendingPayout,
    recentBookings,
    allSessions,
  ] = await Promise.all([
    db.session.findMany({
      where:   { coachId: cp.id, dateStart: { gte: now }, status: { in: ["published", "full"] } },
      orderBy: { dateStart: "asc" },
      take:    6,
    }),
    db.booking.aggregate({
      where: { session: { coachId: cp.id }, status: { in: ["confirmed", "attended"] }, paidAt: { gte: som } },
      _sum:  { amountPaidCents: true },
    }),
    db.booking.aggregate({
      where: { session: { coachId: cp.id }, status: { in: ["confirmed", "attended"] }, paidAt: { gte: lom, lt: som } },
      _sum:  { amountPaidCents: true },
    }),
    db.booking.aggregate({
      where: { session: { coachId: cp.id }, status: { in: ["confirmed", "attended"] } },
      _sum:  { amountPaidCents: true },
    }),
    db.payout.aggregate({
      where: { coachId: cp.id, status: "pending" },
      _sum:  { netAmountCents: true },
    }),
    db.booking.findMany({
      where:   { session: { coachId: cp.id }, status: { in: ["confirmed", "attended"] } },
      include: { session: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    db.session.findMany({
      where:  { coachId: cp.id, status: { in: ["published", "full", "completed"] } },
      select: { spotsTaken: true, maxSpots: true },
    }),
  ]);

  const firstName    = user.name.split(" ")[0];
  const revMonth     = revenueThisMonth._sum.amountPaidCents ?? 0;
  const revLastMonth = revenueLastMonth._sum.amountPaidCents ?? 0;
  const revTotal     = revenueTotal._sum.amountPaidCents ?? 0;
  const pending      = pendingPayout._sum.netAmountCents ?? 0;
  const revGrowth    = revLastMonth > 0
    ? Math.round(((revMonth - revLastMonth) / revLastMonth) * 100)
    : null;
  const avgFill = allSessions.length > 0
    ? Math.round(allSessions.reduce((s, x) => s + x.spotsTaken / x.maxSpots, 0) / allSessions.length * 100)
    : 0;
  const totalParticipants = allSessions.reduce((s, x) => s + x.spotsTaken, 0);
  const nextSession = upcomingSessions[0] ?? null;
  const nextFill    = nextSession
    ? Math.round(nextSession.spotsTaken / nextSession.maxSpots * 100)
    : 0;

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 space-y-10"
      style={{ color: "var(--color-text)" }}
    >

      {/* ── Alerte Stripe ─────────────────────────────────────────────────── */}
      {cp.stripeOnboardingStatus !== "active" && (
        <div className="flex items-center justify-between gap-4 border-l-2 border-[#FF7A00] pl-4 py-2">
          <div>
            <p className="font-display-md text-[10px] tracking-[0.2em] text-[#FF7A00]">
              PAIEMENTS NON ACTIVÉS
            </p>
            <p className="text-xs font-sans mt-0.5" style={{ color: "var(--color-muted)" }}>
              Finalise ton compte Stripe pour recevoir tes revenus
            </p>
          </div>
          <StripeConnectButton incomplete={cp.stripeOnboardingStatus === "pending"} />
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="font-display-md text-[10px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          COACH DASHBOARD
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            className="font-display leading-none"
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
          >
            BONJOUR{" "}
            <span className="flame-text">{firstName.toUpperCase()}.</span>
          </h1>
          <Link
            href="/sessions/new"
            className="shrink-0 font-display-md text-[10px] tracking-[0.2em] text-black px-5 py-3 flame-gradient hover:opacity-90 transition-opacity"
          >
            + CRÉER
          </Link>
        </div>
      </div>

      {/* ── Séparateur ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          APERÇU DU MOIS
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      {/* ── Bloc revenus ──────────────────────────────────────────────────── */}
      <div
        className="border p-6 sm:p-8 space-y-6"
        style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        {/* Revenus principal */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
          <div>
            <p className="font-display-md text-[10px] tracking-[0.2em] mb-2" style={{ color: "var(--color-muted)" }}>
              CE MOIS
            </p>
            <p className="font-display flame-text" style={{ fontSize: "clamp(3rem, 10vw, 5.5rem)", lineHeight: 1 }}>
              {formatPrice(revMonth)}
            </p>
            {revGrowth !== null && (
              <p
                className="font-display-md text-[10px] tracking-widest mt-2"
                style={{ color: revGrowth >= 0 ? "#10b981" : "#FF3D00" }}
              >
                {revGrowth >= 0 ? "↑" : "↓"} {Math.abs(revGrowth)}% vs mois dernier
              </p>
            )}
          </div>

          <div className="flex gap-8">
            <div>
              <p className="font-display-md text-[9px] tracking-[0.2em] mb-1" style={{ color: "var(--color-muted)" }}>
                TOTAL CUMULÉ
              </p>
              <p className="font-display text-2xl" style={{ color: "var(--color-text)" }}>
                {formatPrice(revTotal)}
              </p>
            </div>
            {pending > 0 && (
              <div>
                <p className="font-display-md text-[9px] tracking-[0.2em] mb-1 text-[#FF7A00]">
                  EN ATTENTE
                </p>
                <p className="font-display text-2xl text-[#FF7A00]">{formatPrice(pending)}</p>
                <p className="font-display-md text-[8px] tracking-widest mt-0.5" style={{ color: "var(--color-muted)" }}>
                  VERSEMENT 2–7J
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Barres comparatives */}
        {(revMonth > 0 || revLastMonth > 0) && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
            {[
              { label: "CE MOIS", amount: revMonth, color: "#FF7A00" },
              { label: "MOIS DERNIER", amount: revLastMonth, color: "var(--color-muted)" },
            ].map(({ label, amount, color }) => {
              const max = Math.max(revMonth, revLastMonth, 1);
              const pct = Math.round((amount / max) * 100);
              return (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="font-display-md text-[9px] tracking-widest w-24 shrink-0"
                    style={{ color }}
                  >
                    {label}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }}>
                    <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="font-display-md text-[9px] tracking-widest w-14 text-right shrink-0" style={{ color }}>
                    {formatPrice(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/earnings"
          className="inline-flex items-center gap-2 font-display-md text-[10px] tracking-[0.2em] hover:text-[#FF7A00] transition-colors"
          style={{ color: "var(--color-muted)" }}
        >
          VOIR TOUS LES REVENUS
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* ── Stats 4 colonnes ──────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-4 border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {[
          { value: upcomingSessions.length, label: "À VENIR",   color: "#FF7A00" },
          { value: totalParticipants,        label: "ÉLÈVES",    color: "var(--color-text)" },
          { value: `${avgFill}%`,            label: "REMPLISSAGE", color: avgFill >= 70 ? "#10b981" : avgFill >= 40 ? "#FFB700" : "var(--color-muted)" },
          { value: cp.avgRating > 0 ? `${cp.avgRating.toFixed(1)}` : "—", label: "NOTE / 5",  color: "#FFB700" },
        ].map(({ value, label, color }, i) => (
          <div
            key={label}
            className={`p-4 text-center ${i < 3 ? "border-r" : ""}`}
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}
          >
            <p className="font-display text-2xl sm:text-3xl" style={{ color }}>{value}</p>
            <p className="font-display-md text-[8px] tracking-widest mt-0.5" style={{ color: "var(--color-muted)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Séparateur ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          PROCHAINE SESSION
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      {/* ── Prochaine session hero ────────────────────────────────────────── */}
      {nextSession ? (
        <div
          className="border space-y-5 p-5 sm:p-7"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          {/* Type + countdown */}
          <div className="flex items-center justify-between">
            <span className={nextSession.sessionType === "discovery" ? "badge-discover" : "badge-progress"}>
              {nextSession.sessionType === "discovery" ? "DÉCOUVERTE" : "PROGRESSION"}
            </span>
            <span className="font-display text-2xl text-[#FF7A00]">
              {countdown(nextSession.dateStart, now)}
            </span>
          </div>

          {/* Titre + prix */}
          <Link
            href={`/sessions/${nextSession.id}`}
            className="flex items-start justify-between gap-4 group"
          >
            <h2
              className="font-display leading-[0.9] group-hover:text-[#FF7A00] transition-colors"
              style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", color: "var(--color-text)" }}
            >
              {nextSession.title.toUpperCase()}
            </h2>
            <span className="font-display text-3xl text-[#FF7A00] shrink-0">
              {formatPrice(nextSession.priceCents)}
            </span>
          </Link>

          {/* Date */}
          <p className="text-xs font-sans capitalize" style={{ color: "var(--color-muted)" }}>
            📅 {formatSessionDateTime(nextSession.dateStart, nextSession.durationMin)}
          </p>

          {/* Fill rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="font-display-md text-[10px] tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                TAUX DE REMPLISSAGE
              </span>
              <span
                className="font-display-md text-[10px] tracking-widest"
                style={{ color: fillColor(nextFill) }}
              >
                {nextSession.spotsTaken}/{nextSession.maxSpots}
                {nextSession.status === "full"
                  ? " — COMPLET"
                  : ` — ${nextSession.maxSpots - nextSession.spotsTaken} DISPO`}
              </span>
            </div>
            <div className="h-0.5 w-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${nextFill}%`, backgroundColor: fillColor(nextFill) }}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Link
              href={`/sessions/${nextSession.id}/scan`}
              className="font-display-md text-[10px] tracking-[0.2em] text-black px-5 py-2.5 flame-gradient hover:opacity-90 transition-opacity"
            >
              📷 SCANNER LES QR
            </Link>
            <Link
              href={`/sessions/${nextSession.id}`}
              className="font-display-md text-[10px] tracking-widest hover:text-[#FF7A00] transition-colors"
              style={{ color: "var(--color-muted)" }}
            >
              VOIR DÉTAIL →
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="border p-12 text-center space-y-5"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <p
            className="font-display text-[80px] leading-none"
            style={{ color: "var(--color-border)" }}
          >
            0
          </p>
          <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
            Aucune session à venir. Crée ta première et partage le lien.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex font-display-md text-[11px] tracking-[0.2em] text-black px-8 py-4 flame-gradient hover:opacity-90 transition-opacity pulse-orange"
          >
            CRÉER UNE SESSION →
          </Link>
        </div>
      )}

      {/* ── Suite du programme ────────────────────────────────────────────── */}
      {upcomingSessions.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
              SUITE DU PROGRAMME — {upcomingSessions.length - 1}
            </p>
            <Link
              href="/sessions"
              className="font-display-md text-[9px] tracking-[0.2em] hover:text-[#FF7A00] transition-colors"
              style={{ color: "var(--color-muted)" }}
            >
              TOUT VOIR →
            </Link>
          </div>

          <div
            className="border divide-y"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}
          >
            {upcomingSessions.slice(1).map(s => {
              const pct  = Math.round(s.spotsTaken / s.maxSpots * 100);
              const left = s.maxSpots - s.spotsTaken;
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-[#FF7A00]/5 transition-colors group"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {/* Date bloc */}
                  <div className="shrink-0 w-8 text-center">
                    <p className="font-display text-xl text-[#FF7A00] leading-none">
                      {new Date(s.dateStart).getDate()}
                    </p>
                    <p className="font-display-md text-[8px]" style={{ color: "var(--color-muted)" }}>
                      {new Date(s.dateStart).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display text-sm truncate group-hover:text-[#FF7A00] transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      {s.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }}>
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: fillColor(pct) }}
                        />
                      </div>
                      <span
                        className="font-display-md text-[9px] shrink-0"
                        style={{ color: fillColor(pct) }}
                      >
                        {s.status === "full" ? "COMPLET" : `${left}p`}
                      </span>
                    </div>
                  </div>

                  <span className="font-display text-lg text-[#FF7A00] shrink-0">
                    {formatPrice(s.priceCents)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Séparateur ────────────────────────────────────────────────────── */}
      {recentBookings.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
            ACTIVITÉ RÉCENTE
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        </div>
      )}

      {/* ── Dernières réservations ────────────────────────────────────────── */}
      {recentBookings.length > 0 && (
        <div
          className="border divide-y"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}
        >
          {recentBookings.map(b => (
            <div
              key={b.id}
              className="flex items-center gap-4 px-4 py-3.5"
              style={{ borderColor: "var(--color-border)" }}
            >
              {/* Initiale */}
              <div
                className="w-8 h-8 shrink-0 flex items-center justify-center border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="font-display text-sm text-[#FF7A00]">
                  {b.participantName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium truncate" style={{ color: "var(--color-text)" }}>
                  {b.participantName}
                </p>
                <p className="text-xs font-sans truncate" style={{ color: "var(--color-muted)" }}>
                  {b.session.title}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-display text-base text-[#FF7A00]">
                  {b.amountPaidCents ? formatPrice(b.amountPaidCents) : "—"}
                </p>
                <p className="font-display-md text-[8px] tracking-widest" style={{ color: "var(--color-muted)" }}>
                  {b.status === "attended" ? "PRÉSENT ✓" : "CONFIRMÉ"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {[
          { href: "/sessions/new", label: "CRÉER\nSESSION", primary: true },
          { href: "/earnings",     label: "MES\nREVENUS",   primary: false },
          { href: "/sessions",     label: "TOUTES\nSESSIONS", primary: false },
        ].map(({ href, label, primary }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center py-5 text-center transition-colors ${i < 2 ? "border-r" : ""} ${
              primary
                ? "bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 border-[#FF7A00]/20"
                : "hover:bg-[#FF7A00]/5"
            }`}
            style={{
              borderColor: primary ? undefined : "var(--color-border)",
              backgroundColor: primary ? undefined : undefined,
            }}
          >
            <span
              className="font-display-md text-[10px] tracking-[0.2em] whitespace-pre-line leading-relaxed"
              style={{ color: primary ? "#FF7A00" : "var(--color-muted)" }}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Note moyenne ──────────────────────────────────────────────────── */}
      {cp.avgRating > 0 && (
        <div
          className="border p-5 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <div className="space-y-2">
            <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
              TA NOTE MOYENNE
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="text-xl"
                  style={{ color: i < Math.round(cp.avgRating) ? "#FFB700" : "var(--color-border)" }}
                >
                  ★
                </span>
              ))}
              <span className="font-display text-3xl ml-2" style={{ color: "var(--color-text)" }}>
                {cp.avgRating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-5xl text-[#FF7A00]">{cp.totalSessions}</p>
            <p className="font-display-md text-[9px] tracking-widest" style={{ color: "var(--color-muted)" }}>
              SESSIONS AU TOTAL
            </p>
          </div>
        </div>
      )}

      {/* ── Footer spacer ─────────────────────────────────────────────────── */}
      <div className="h-4" />

    </div>
  );
}
