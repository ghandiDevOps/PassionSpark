import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SessionTypeBadge } from "@/components/ui/badge";
import { SpotsCounter } from "@/components/session/spots-counter";
import { formatPrice } from "@/lib/utils/format-price";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import Link from "next/link";
import { APP_URL } from "@/constants";

interface Props {
  params: { slug: string };
}

async function getSession(slug: string) {
  return db.session.findUnique({
    where:   { slug },
    include: { coach: { include: { user: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getSession(params.slug);
  if (!session) return { title: "Session introuvable" };

  const title       = `${session.title} — ${formatPrice(session.priceCents)}`;
  const description = session.tagline ?? session.description.slice(0, 160);
  const url         = `${APP_URL}/s/${session.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type:   "website",
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function SessionPage({ params }: Props) {
  const session = await getSession(params.slug);

  if (!session || session.status === "cancelled") notFound();

  const spotsLeft = session.maxSpots - session.spotsTaken;
  const isFull    = spotsLeft <= 0;
  const isUrgent  = !isFull && spotsLeft <= 3;
  const coachName = session.coach.user.name;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero photo plein écran — style Manus "Atelier Minuit" ── */}
      {session.coverImageUrl ? (
        <section className="relative w-full aspect-[16/7] overflow-hidden">
          <img
            src={session.coverImageUrl}
            alt={session.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          {/* Badge univers en haut gauche */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Link href="/explore" className="font-display-md text-xs text-white/60 hover:text-white transition-colors tracking-[0.15em] bg-black/30 backdrop-blur-sm px-3 py-1.5">
              ← RETOUR
            </Link>
            <span className="font-display-md text-xs text-white tracking-[0.15em] bg-[#FF7A00] px-3 py-1.5">
              {session.domain?.toUpperCase() ?? session.category.toUpperCase()}
            </span>
          </div>
          {/* Titre en overlay bas */}
          <div className="absolute bottom-6 left-6 right-6">
            <p className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em] mb-2">
              {session.category.toUpperCase()} · {session.locationAddress.split(",").pop()?.trim().toUpperCase()}
            </p>
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-white leading-[0.88]">
              {session.title}
            </h1>
          </div>
        </section>
      ) : (
        /* Fallback sans photo */
        <section className="pt-14 px-4 pb-8 border-b border-[#1e1e1e]">
          <div className="max-w-lg mx-auto space-y-4 pt-6">
            <Link href="/explore" className="font-display-md text-xs text-[#444] hover:text-[#FF7A00] transition-colors tracking-[0.15em]">
              ← RETOUR AUX SESSIONS
            </Link>
            <p className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">
              {session.domain?.toUpperCase() ?? session.category.toUpperCase()}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-[0.88]">
              {session.title}
            </h1>
            {session.tagline && (
              <p className="text-[#666] text-base leading-relaxed">{session.tagline}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Contenu 2 colonnes — style Manus ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-12">

        {/* ── Colonne gauche ── */}
        <div className="space-y-8">

          {/* Profil coach */}
          <div className="flex items-start gap-4 pb-8 border-b border-[#1e1e1e]">
            {session.coach.user.avatarUrl ? (
              <img
                src={session.coach.user.avatarUrl}
                alt={coachName}
                className="w-12 h-12 rounded-full object-cover border border-[#2a2a2a] shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-[#FF7A00]/20 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] font-bold shrink-0">
                {coachName[0]}
              </div>
            )}
            <div>
              <p className="font-display-md text-xs text-[#444] tracking-[0.15em] mb-1">VOTRE COACH</p>
              <p className="text-white font-semibold">{coachName}</p>
              {session.coach.avgRating > 0 && (
                <p className="text-[#555] text-xs mt-1">
                  ★ {session.coach.avgRating.toFixed(1)} · {session.coach.totalSessions} sessions
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em] mb-3">L'EXPÉRIENCE</p>
            <p className="text-[#aaa] leading-relaxed text-base whitespace-pre-wrap">
              {session.description}
            </p>
          </div>

          {/* Compétence */}
          {session.skillFocus && (
            <div className="border-t border-[#1e1e1e] pt-6">
              <p className="font-display-md text-xs text-[#444] tracking-[0.15em] mb-2">COMPÉTENCE TRAVAILLÉE</p>
              <p className="text-white">{session.skillFocus}</p>
            </div>
          )}

          {/* Lieu */}
          <div className="border-t border-[#1e1e1e] pt-6">
            <p className="font-display-md text-xs text-[#444] tracking-[0.15em] mb-2">LIEU</p>
            <p className="text-white">{session.locationAddress}</p>
          </div>

          {/* Retour */}
          <div className="pt-4">
            <Link href="/explore" className="font-display-md text-xs text-[#444] hover:text-[#FF7A00] transition-colors tracking-[0.15em]">
              ← RETOUR AUX SESSIONS
            </Link>
          </div>
        </div>

        {/* ── Colonne droite sticky — Bloc réservation ── */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-[#111] border border-[#1e1e1e] p-6 space-y-5">

            <p className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">RÉSERVER CETTE SESSION</p>

            {/* Prix */}
            <div>
              <span className="font-display text-5xl text-[#FF7A00]">
                {formatPrice(session.priceCents)}
              </span>
              <span className="text-[#555] text-sm ml-2">/ personne</span>
            </div>

            {/* Infos */}
            <div className="space-y-3 border-t border-[#1e1e1e] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[#555] text-sm">Date</span>
                <span className="text-white font-semibold text-sm text-right">
                  {formatSessionDateTime(session.dateStart, session.durationMin)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#555] text-sm">Durée</span>
                <span className="text-white font-semibold text-sm">{session.durationMin} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#555] text-sm">Places restantes</span>
                <SpotsCounter
                  sessionId={session.id}
                  initialSpotsTaken={session.spotsTaken}
                  maxSpots={session.maxSpots}
                />
              </div>
            </div>

            {/* CTA */}
            {isFull ? (
              <span className="block w-full text-center py-4 border border-[#2a2a2a] text-[#555] font-display-md text-xs tracking-[0.2em] cursor-not-allowed">
                SESSION COMPLÈTE
              </span>
            ) : (
              <Link
                href={`/book/${session.id}`}
                className={`btn-passion w-full text-center text-sm py-4 ${isUrgent ? "pulse-orange" : ""}`}
              >
                {isUrgent
                  ? `RÉSERVER — ${spotsLeft} PLACE${spotsLeft > 1 ? "S" : ""} ⚡`
                  : "RÉSERVER →"}
              </Link>
            )}

            <p className="text-[#444] text-xs text-center">Annulation gratuite jusqu'à 48 h avant.</p>
          </div>
        </div>

      </section>

    </main>
  );
}
