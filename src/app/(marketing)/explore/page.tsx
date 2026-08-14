import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatDateShort, formatTime } from "@/lib/utils/format-date";
import { ExploreClient } from "@/components/marketing/explore-client";
import type { SessionCardData } from "@/components/marketing/session-card";

type SessionWithCoach = Prisma.SessionGetPayload<{
  include: { coach: { include: { user: true } } };
}>;

export const metadata = {
  title: "Sessions · Passion Spark",
  description: "Toutes les sessions disponibles. Réservez en 30 secondes.",
};

function extractCity(address: string): string {
  const parts = address.split(",");
  return parts[parts.length - 1].trim();
}

export default async function ExplorePage() {
  const now = new Date();

  let rawSessions: SessionWithCoach[] = [];
  try {
    rawSessions = await db.session.findMany({
      where: {
        status:    { in: ["published", "full"] },
        dateStart: { gte: now },
      },
      include: {
        coach: { include: { user: true } },
      },
      orderBy: { dateStart: "asc" },
    });
  } catch {
    // DB temporairement indisponible — affiche la page vide plutôt qu'un 500
  }

  const sessions: SessionCardData[] = rawSessions.map((s) => ({
    slug:         s.slug,
    title:        s.title,
    category:     s.category,
    domain:       s.domain,
    coachName:    s.coach.user.name,
    coachRating:  s.coach.avgRating,
    dateLabel:    `${formatDateShort(s.dateStart)} · ${formatTime(s.dateStart)}`,
    city:         extractCity(s.locationAddress),
    priceCents:   s.priceCents,
    maxSpots:     s.maxSpots,
    spotsTaken:   s.spotsTaken,
    sessionType:  s.sessionType === "discovery" ? "discovery" : "progression",
    coverImageUrl: s.coverImageUrl,
  }));

  // Catégories uniques triées alphabétiquement
  const categorySet: Record<string, true> = {};
  for (const s of rawSessions) { categorySet[s.category] = true; }
  const categories = Object.keys(categorySet).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── HEADER — style "Atelier Minuit" inspiré Manus ── */}
      <div className="pt-14 border-b border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="font-display-md text-xs text-[#FF7A00] tracking-[0.25em] mb-4">
            LE CATALOGUE
            {sessions.length > 0 && (
              <span className="text-[#444] ml-2">/ {String(sessions.length).padStart(2, "0")} EXPÉRIENCES</span>
            )}
          </p>
          <h1 className="font-display text-[clamp(3rem,7vw,6rem)] text-white leading-[0.88]">
            TROUVEZ VOTRE<br />
            <span className="text-[#FF7A00]">PROCHAIN OUI.</span>
          </h1>
        </div>
      </div>


{/* ── CONTENU PRINCIPAL ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24">

        {/* État vide global — aucune session en base */}
        {sessions.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display text-[5rem] text-[#2a2a2a] leading-none mb-6">0</p>
            <p className="font-display text-2xl text-white mb-3">LES PREMIÈRES SESSIONS ARRIVENT.</p>
            <p className="text-[#555] text-sm font-sans max-w-sm mx-auto mb-8">
              Les coachs préparent leurs premières sessions. Reviens bientôt — ou sois le premier à en créer une.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up" className="btn-passion px-8">
                DEVENIR COACH →
              </Link>
            </div>
          </div>
        ) : (
          <ExploreClient sessions={sessions} categories={categories} />
        )}
      </section>

    </div>
  );
}
