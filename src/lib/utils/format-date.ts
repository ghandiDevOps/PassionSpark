import { addMinutes, formatDistanceToNow, isFuture } from "date-fns";
import { fr } from "date-fns/locale";

// ── Timezone Paris (UTC+1 hiver / UTC+2 été) ──────────────────────────────
// On utilise Intl.DateTimeFormat natif pour éviter d'ajouter date-fns-tz.
// Vercel / Node tourne en UTC → sans timezone explicite date-fns affiche UTC.
const TZ = "Europe/Paris";

function formatParis(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, ...options }).format(date);
}

/**
 * Ex: "Samedi 18 avril 2026" (heure Paris)
 */
export function formatDateLong(date: Date): string {
  return formatParis(date, {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });
}

/**
 * Ex: "Sam. 18 avr." (heure Paris)
 */
export function formatDateShort(date: Date): string {
  return formatParis(date, {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  });
}

/**
 * Ex: "10h00" (heure Paris)
 */
export function formatTime(date: Date): string {
  // Intl renvoie "10:00" en fr-FR → on remplace ":" par "h"
  const raw = formatParis(date, { hour: "2-digit", minute: "2-digit", hour12: false });
  return raw.replace(":", "h");
}

/**
 * Ex: "Samedi 18 avril · 10h00 – 11h00" (heure Paris)
 */
export function formatSessionDateTime(dateStart: Date, durationMin: number): string {
  const dateEnd = addMinutes(dateStart, durationMin);
  const day   = formatParis(dateStart, { weekday: "long", day: "numeric", month: "long" });
  const start = formatTime(dateStart);
  const end   = formatTime(dateEnd);
  return `${day} · ${start} – ${end}`;
}

/**
 * Ex: "dans 2 jours" ou "il y a 3 heures"
 */
export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

/**
 * Vérifie si une session est encore dans le futur
 */
export function isSessionFuture(dateStart: Date): boolean {
  return isFuture(dateStart);
}
