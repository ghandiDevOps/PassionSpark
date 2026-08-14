"use client";

import Link from "next/link";

export type SessionCardData = {
  slug: string;
  title: string;
  category: string;
  domain: string;
  coachName: string;
  coachRating: number;
  dateLabel: string;
  city: string;
  priceCents: number;
  maxSpots: number;
  spotsTaken: number;
  sessionType: "discovery" | "progression";
  coverImageUrl: string | null;
};

/* ── Domain placeholder icons (inline SVG — no emojis) ─────────── */
function DomainPlaceholder({ domain }: { domain: string }) {
  const d = domain.toLowerCase();

  if (d === "sport")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M19.07 4.93l-4.24 4.24M9.17 9.17 4.93 19.07"/>
      </svg>
    );
  if (d === "music")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    );
  if (d === "cooking")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
        <line x1="6" y1="17" x2="18" y2="17"/>
      </svg>
    );
  if (d === "language")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
    );
  if (d === "business")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    );
  if (d === "art")
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    );

  // Default: flame / spark
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

/* ── Flame SVG icon (replaces 🔥 emoji) ────────────────────────── */
function FlameIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

export function SessionCard({ s }: { s: SessionCardData }) {
  const spotsLeft = s.maxSpots - s.spotsTaken;
  const pct       = Math.round((s.spotsTaken / s.maxSpots) * 100);
  const urgent    = spotsLeft <= 3 && spotsLeft > 0;
  const isFull    = spotsLeft <= 0;
  const price     = s.priceCents / 100;

  return (
    <Link
      href={`/s/${s.slug}`}
      className="session-card bg-[#111] border border-[#1e1e1e] overflow-hidden group block cursor-pointer hover:border-[#FF7A00]/50 transition-colors duration-200"
    >
      {/* ── Image ── */}
      <div className="relative h-44 bg-[#111] overflow-hidden">
        {s.coverImageUrl ? (
          <img
            src={s.coverImageUrl}
            alt={s.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-[#FF7A00]"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a0a00 100%)" }}
          >
            <DomainPlaceholder domain={s.domain} />
            <div
              className="absolute bottom-0 left-0 right-0 h-16"
              style={{ background: "linear-gradient(to top, #1e1e1e, transparent)" }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="badge-sport text-[10px] px-2 py-1">{s.category}</span>
          <span className={s.sessionType === "discovery" ? "badge-discover" : "badge-progress"}>
            {s.sessionType === "discovery" ? "DÉCOUVERTE" : "PROGRESSION"}
          </span>
        </div>

        {/* Urgence — SVG flame au lieu de 🔥 */}
        {urgent && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#FF3D00]/90 px-2 py-1 text-[10px] font-bold font-display-md text-white">
            <FlameIcon />
            {spotsLeft} PLACE{spotsLeft > 1 ? "S" : ""}
          </div>
        )}
        {isFull && (
          <div className="absolute top-3 right-3 bg-[#1a1a1a]/90 px-2 py-1 text-[10px] font-display-md text-[#555]">
            COMPLET
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <div className="p-4 lg:p-5">
        <h3 className="font-display text-lg text-white leading-tight mb-2 group-hover:text-[#FF7A00] transition-colors duration-200">
          {s.title}
        </h3>

        <div className="flex items-center gap-2 mb-1">
          {/* Avatar initiales */}
          <div className="w-5 h-5 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/30 shrink-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-[#FF7A00] leading-none select-none">
              {s.coachName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-[#888] text-xs font-sans">{s.coachName}</span>
          {s.coachRating > 0 && (
            <span className="text-[#FF7A00] text-xs ml-auto tabular-nums">★ {s.coachRating.toFixed(1)}</span>
          )}
        </div>

        <div className="text-[#666] text-xs font-sans mb-3">
          {s.city} · {s.dateLabel}
        </div>

        {/* Barre de remplissage */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-sans mb-1.5">
            <span className={urgent ? "text-[#FF3D00]" : isFull ? "text-[#555]" : "text-[#555]"}>
              {isFull
                ? "Session complète"
                : `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} restante${spotsLeft > 1 ? "s" : ""}`}
            </span>
            <span className="text-[#444] tabular-nums">{pct}%</span>
          </div>
          <div className="w-full bg-[#2a2a2a] h-0.5 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-500 ${urgent ? "bg-[#FF3D00]" : isFull ? "bg-[#555]" : "bg-[#FF7A00]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="font-display text-3xl text-[#FF7A00] tabular-nums">{price}€</span>
            <span className="font-display-md text-xs text-[#444] ml-1">/ pers.</span>
          </div>
          {!isFull && (
            <span className="btn-passion text-xs px-4 py-2 min-h-0 cursor-pointer">RÉSERVER →</span>
          )}
        </div>
      </div>

      {/* Glow border bottom on hover */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FF7A00]/0 to-transparent group-hover:via-[#FF7A00]/60 transition-all duration-300" />
    </Link>
  );
}
