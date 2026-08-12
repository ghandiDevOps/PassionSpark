// ─── Pricing ────────────────────────────────────────────────────────────────
export const MIN_PRICE_CENTS = 1300;    // 13€
export const MAX_PRICE_CENTS = 2000;    // 20€
export const PLATFORM_FEE_PERCENT = 23; // 23% Passion Spark
export const REFERRAL_FEE_PERCENT =  7; // 7%  Parrainage
export const COACH_SHARE_PERCENT  = 70; // 70% Coach

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_NAME = "Passion Spark";
export const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://passionspark.fr";

// ─── Session ─────────────────────────────────────────────────────────────────
export const MIN_SPOTS = 2;
export const MAX_SPOTS = 20;
export const DURATION_OPTIONS = [60, 120] as const;

// ─── Annulation ──────────────────────────────────────────────────────────────
export const CANCELLATION_DEADLINE_HOURS = 24; // Remboursement si > 24h avant

// ─── Domaines ────────────────────────────────────────────────────────────────
export const DOMAIN_LABELS: Record<string, string> = {
  sport:    "Sport",
  music:    "Musique",
  cooking:  "Cuisine",
  language: "Langues",
  business: "Business",
  art:      "Art & Créa",
  other:    "Autre",
};

export const DOMAIN_EMOJIS: Record<string, string> = {
  sport:    "🥊",
  music:    "🎸",
  cooking:  "🍳",
  language: "🌍",
  business: "💼",
  art:      "🎨",
  other:    "✨",
};

// ─── Types de session ─────────────────────────────────────────────────────────
export const SESSION_TYPE_LABELS = {
  discovery:   "Découverte",
  progression: "Progression",
} as const;

export const SESSION_TYPE_DESCRIPTIONS = {
  discovery:   "Pour ceux qui n'ont jamais pratiqué et veulent ressentir pour la première fois.",
  progression: "Pour les pratiquants qui veulent débloquer un point précis.",
} as const;
