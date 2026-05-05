import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { QRCodeSVG } from "qrcode.react";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import Link from "next/link";

export const metadata = { title: "Mes billets · Passion Spark" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function countdown(date: Date, now: Date): string {
  const ms  = date.getTime() - now.getTime();
  if (ms <= 0) return "Terminé";
  const h   = Math.floor(ms / 3_600_000);
  const d   = Math.floor(ms / 86_400_000);
  if (h < 1)  return "Dans moins d'1h";
  if (h < 24) return `Dans ${h}h`;
  if (d === 1) return "Demain";
  if (d < 7)  return `Dans ${d} jours`;
  const w = Math.floor(d / 7);
  return `Dans ${w} semaine${w > 1 ? "s" : ""}`;
}

function icalUrl(s: { title: string; dateStart: Date; durationMin: number; locationAddress: string }) {
  const fmt  = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end  = new Date(s.dateStart.getTime() + s.durationMin * 60_000);
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Passion Spark//FR",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(s.dateStart)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${s.title}`, `LOCATION:${s.locationAddress}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  MMA: "#D86529", Boxe: "#D86529", "Muay Thaï": "#D86529",
  Padel: "#10b981", Basket: "#10b981", Yoga: "#10b981", Méditation: "#10b981",
  Guitare: "#3b82f6", "Production musicale": "#3b82f6", Beatmaking: "#3b82f6",
  "Cuisine française": "#f59e0b", Boulangerie: "#f59e0b",
  Dessin: "#a855f7", Peinture: "#a855f7",
  "Développement web": "#06b6d4",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#FF7A00";
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MyBookingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email     = clerkUser?.emailAddresses?.[0]?.emailAddress;
  const firstName = clerkUser?.firstName ?? "";
  if (!email) redirect("/sign-in");

  const now = new Date();

  const dbUser = await db.user.findUnique({
    where:  { clerkId: userId },
    select: { id: true },
  });

  const bookings = await db.booking.findMany({
    where: {
      OR: [
        { participantEmail: email },
        ...(dbUser ? [{ userId: dbUser.id }] : []),
      ],
      status: { not: "pending" },
    },
    include: {
      session: {
        include: { coach: { include: { user: true } } },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const upcoming  = bookings.filter(b => b.session.dateStart > now && b.status === "confirmed");
  const past      = bookings.filter(b => b.session.dateStart <= now || b.status === "attended" || b.status === "cancelled");
  const active    = bookings.filter(b => b.status !== "cancelled");
  const attended  = bookings.filter(b => b.status === "attended");
  const totalSpent = active.reduce((s, b) => s + (b.amountPaidCents ?? 0), 0);
  const nextSession = upcoming[0] ?? null;

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (bookings.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-12 text-center space-y-4">
          <p className="font-display text-6xl text-[#2a2a2a]">0</p>
          <p className="text-[#555] text-sm font-sans">
            {firstName ? `${firstName}, tu` : "Tu"} n&apos;as pas encore réservé de session.
          </p>
          <p className="text-[#444] text-xs font-sans">
            10–20 personnes · 1 compétence précise · 1h · dès 13€
          </p>
          <Link href="/explore" className="btn-passion px-8 inline-flex mt-2">EXPLORER LES SESSIONS →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox value={upcoming.length}  label="À VENIR"   color="#FF7A00" />
        <StatBox value={attended.length}  label="VÉCUES"    color="white" />
        <StatBox value={active.length}    label="TOTAL"     color="white" />
        <StatBox
          value={totalSpent > 0 ? formatPrice(totalSpent) : "0€"}
          label="INVESTIS"
          color="white"
        />
      </div>

      {/* ── Prochain cours — carte hero ───────────────────────────────────── */}
      {nextSession && (
        <section className="space-y-3">
          <SectionTitle label="PROCHAIN COURS" />

          <div className="bg-[#1e1e1e] border border-[#FF7A00]/50 p-5 space-y-5">

            {/* Badge catégorie + countdown */}
            <div className="flex items-center justify-between gap-2">
              <CategoryBadge category={(nextSession.session as any).category ?? ""} />
              <span className="font-display-md text-xs text-[#FF7A00] tracking-widest">
                {countdown(nextSession.session.dateStart, now)}
              </span>
            </div>

            {/* Titre */}
            <div>
              <h2 className="font-display text-2xl text-white leading-tight">
                {nextSession.session.title.toUpperCase()}
              </h2>
              <p className="text-[#888] text-xs font-sans mt-1 capitalize">
                {formatSessionDateTime(nextSession.session.dateStart, nextSession.session.durationMin)}
              </p>
            </div>

            {/* Infos */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-[#888]">
                <span>📍</span>
                <span className="font-sans text-xs">{nextSession.session.locationAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-[#888]">
                <span>👤</span>
                <span className="font-sans text-xs">Coach : <span className="text-white">{nextSession.session.coach.user.name}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[#888]">
                <span>💶</span>
                <span className="font-sans text-xs text-white font-semibold">
                  {nextSession.amountPaidCents ? formatPrice(nextSession.amountPaidCents) : formatPrice(nextSession.session.priceCents)} payé
                </span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={icalUrl(nextSession.session)}
                download="passion-spark.ics"
                className="btn-passion-outline text-center text-xs py-2.5"
              >
                📅 CALENDRIER
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(nextSession.session.locationAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-passion-outline text-center text-xs py-2.5"
              >
                🗺️ ITINÉRAIRE
              </a>
            </div>

            {/* QR Code — toujours visible */}
            <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
              <p className="font-display-md text-[10px] text-[#555] tracking-widest">TON BILLET D&apos;ENTRÉE</p>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <QRCodeSVG value={nextSession.qrToken} size={180} level="H" includeMargin />
                </div>
                <p className="text-xs text-[#555] text-center font-sans">
                  Montre ce code à l&apos;entrée · valable une seule fois
                </p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── Autres sessions à venir ───────────────────────────────────────── */}
      {upcoming.length > 1 && (
        <section className="space-y-3">
          <SectionTitle label="ÉGALEMENT À VENIR" />
          {upcoming.slice(1).map(b => (
            <UpcomingCard key={b.id} booking={b} now={now} />
          ))}
        </section>
      )}

      {/* ── Historique ────────────────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="space-y-3">
          <SectionTitle label={`HISTORIQUE · ${past.length} SESSION${past.length > 1 ? "S" : ""}`} />
          {past.map(b => (
            <PastCard key={b.id} booking={b} now={now} />
          ))}
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-6 text-center space-y-3">
        <p className="font-display text-2xl text-white">UNE AUTRE PASSION ?</p>
        <p className="text-[#555] text-xs font-sans">Musique · Sport · Cuisine · Art · Tech</p>
        <Link href="/explore" className="btn-passion px-10 inline-flex">EXPLORER →</Link>
      </div>

    </div>
  );
}

// ── Sub-composants ────────────────────────────────────────────────────────────

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 bg-[#FF7A00]" />
        <span className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">MES BILLETS</span>
      </div>
      <h1 className="font-display text-4xl text-white">TES SESSIONS</h1>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return <h2 className="font-display-md text-xs text-[#555] tracking-widest">{label}</h2>;
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-3 text-center">
      <p className="font-display text-xl" style={{ color }}>{value}</p>
      <p className="font-display-md text-[8px] text-[#555] mt-0.5 tracking-widest">{label}</p>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  if (!category) return null;
  const color = categoryColor(category);
  return (
    <span
      className="font-display-md text-[9px] tracking-widest px-2 py-1 border"
      style={{ color, borderColor: `${color}40` }}
    >
      {category.toUpperCase()}
    </span>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type BookingFull = Awaited<ReturnType<typeof db.booking.findMany>>[0] & {
  session: {
    title: string;
    dateStart: Date;
    durationMin: number;
    locationAddress: string;
    priceCents: number;
    category: string;
    slug: string;
    coach: { user: { name: string } };
  };
  review: { rating: number } | null;
};

// ── Card à venir ──────────────────────────────────────────────────────────────

function UpcomingCard({ booking: b, now }: { booking: BookingFull; now: Date }) {
  const s = b.session;
  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={s.category} />
          </div>
          <h3 className="font-display text-lg text-white leading-tight">{s.title}</h3>
          <p className="text-[#888] text-xs font-sans mt-0.5 capitalize">
            {formatSessionDateTime(s.dateStart, s.durationMin)}
          </p>
        </div>
        <span className="font-display-md text-xs text-[#FF7A00] shrink-0">
          {countdown(s.dateStart, now)}
        </span>
      </div>
      <div className="text-xs text-[#555] font-sans space-y-1">
        <p>📍 {s.locationAddress}</p>
        <p>👤 {s.coach.user.name}</p>
      </div>
      <div className="flex gap-2">
        <a
          href={icalUrl(s)}
          download="passion-spark.ics"
          className="flex-1 btn-passion-outline text-center text-xs py-2"
        >
          📅 CALENDRIER
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(s.locationAddress)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-passion-outline text-center text-xs py-2"
        >
          🗺️ MAPS
        </a>
        <Link
          href={`/s/${s.slug}`}
          className="flex-1 btn-passion-outline text-center text-xs py-2"
        >
          VOIR →
        </Link>
      </div>
    </div>
  );
}

// ── Card passée ───────────────────────────────────────────────────────────────

function PastCard({ booking: b, now }: { booking: BookingFull; now: Date }) {
  const s           = b.session;
  const isAttended  = b.status === "attended";
  const isCancelled = b.status === "cancelled";

  const statusLabel = isCancelled ? "ANNULÉ"
                    : isAttended  ? "PRÉSENT ✓"
                    : "TERMINÉ";
  const statusColor = isCancelled ? "text-[#FF3D00]"
                    : isAttended  ? "text-[#10b981]"
                    : "text-[#555]";

  return (
    <div className={`bg-[#1e1e1e] border border-[#2a2a2a] p-4 space-y-3 ${isCancelled ? "opacity-40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-1"><CategoryBadge category={s.category} /></div>
          <h3 className="font-display text-base text-white leading-tight">{s.title}</h3>
          <p className="text-[#555] text-xs font-sans mt-0.5 capitalize">
            {formatSessionDateTime(s.dateStart, s.durationMin)}
          </p>
        </div>
        <span className={`font-display-md text-xs shrink-0 mt-1 ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="text-xs text-[#555] font-sans flex items-center gap-4">
        <span>👤 {s.coach.user.name}</span>
        {b.amountPaidCents && <span>💶 {formatPrice(b.amountPaidCents)}</span>}
      </div>

      {/* Avis */}
      {isAttended && !b.review && (
        <div className="border-t border-[#2a2a2a] pt-3">
          <p className="font-display-md text-[9px] text-[#555] tracking-widest mb-1">LAISSE TON AVIS</p>
          <Link href={`/s/${s.slug}`} className="font-display-md text-xs text-[#FF7A00] hover:underline tracking-widest">
            NOTER CETTE SESSION →
          </Link>
        </div>
      )}

      {b.review && (
        <div className="border-t border-[#2a2a2a] pt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < b.review!.rating ? "text-[#FF7A00]" : "text-[#2a2a2a]"}`}>★</span>
          ))}
          <span className="text-[#555] text-xs font-sans ml-1">Ton avis</span>
        </div>
      )}
    </div>
  );
}
