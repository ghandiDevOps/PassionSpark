import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { formatSessionDateTime } from "@/lib/utils/format-date";

export const metadata = { title: "Mes sessions · Passion Spark" };

export default async function SessionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) redirect("/onboarding");

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    db.session.findMany({
      where:   { coachId: user.coachProfile.id, dateStart: { gte: now } },
      orderBy: { dateStart: "asc" },
    }),
    db.session.findMany({
      where:   { coachId: user.coachProfile.id, dateStart: { lt: now } },
      orderBy: { dateStart: "desc" },
      take:    20,
    }),
  ]);

  return (
    <div className="px-4 sm:px-6 py-8 space-y-10" style={{ color: "var(--color-text)" }}>

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="font-display-md text-[10px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
            COACH DASHBOARD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}>
            MES <span className="flame-text">SESSIONS.</span>
          </h1>
        </div>
        <Link href="/sessions/new" className="shrink-0 font-display-md text-[10px] tracking-[0.2em] text-black px-5 py-3 flame-gradient hover:opacity-90 transition-opacity">
          + CRÉER
        </Link>
      </div>

      {/* ── À venir ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
            À VENIR — {upcoming.length}
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        </div>

        {upcoming.length === 0 ? (
          <div className="border p-12 text-center space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
            <p className="font-display text-[80px] leading-none" style={{ color: "var(--color-border)" }}>0</p>
            <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
              Aucune session programmée.
            </p>
            <Link href="/sessions/new" className="inline-flex font-display-md text-[11px] tracking-[0.2em] text-black px-8 py-4 flame-gradient hover:opacity-90 transition-opacity">
              CRÉER MA PREMIÈRE SESSION →
            </Link>
          </div>
        ) : (
          <div className="border divide-y" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
            {upcoming.map(s => <SessionRow key={s.id} session={s} />)}
          </div>
        )}
      </section>

      {/* ── Passées ── */}
      {past.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
              PASSÉES — {past.length}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>
          <div className="border divide-y opacity-60" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
            {past.map(s => <SessionRow key={s.id} session={s} past />)}
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  );
}

function fillColor(pct: number): string {
  if (pct >= 100) return "#FF3D00";
  if (pct >= 75)  return "#FF7A00";
  if (pct >= 40)  return "#FFB700";
  return "#10b981";
}

function SessionRow({ session, past = false }: { session: any; past?: boolean }) {
  const pct  = Math.round(session.spotsTaken / session.maxSpots * 100);
  const left = session.maxSpots - session.spotsTaken;
  const full = session.status === "full";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#FF7A00]/5 transition-colors group"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Date bloc */}
      <div className="shrink-0 w-8 text-center">
        <p className="font-display text-xl text-[#FF7A00] leading-none">
          {new Date(session.dateStart).getDate()}
        </p>
        <p className="font-display-md text-[8px]" style={{ color: "var(--color-muted)" }}>
          {new Date(session.dateStart).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
        </p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-display text-sm truncate group-hover:text-[#FF7A00] transition-colors mb-1.5"
          style={{ color: "var(--color-text)" }}
        >
          {session.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }}>
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: fillColor(pct) }}
            />
          </div>
          <span
            className="font-display-md text-[9px] shrink-0"
            style={{ color: fillColor(pct) }}
          >
            {full ? "COMPLET" : past ? `${session.spotsTaken}/${session.maxSpots}` : `${left}p`}
          </span>
        </div>
      </div>

      {/* Prix */}
      <span className="font-display text-lg text-[#FF7A00] shrink-0">
        {formatPrice(session.priceCents)}
      </span>
    </Link>
  );
}
