import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatSessionDateTime } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import { BookingForm } from "./booking-form";

interface Props {
  params: { sessionId: string };
}

// ── Écran : session non disponible au paiement ────────────────────────────

function StripeNotReadyScreen({ sessionTitle }: { sessionTitle: string }) {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-1 h-12 bg-[#FF7A00] mx-auto mb-8" />
      <p className="font-display text-5xl mb-4">⏳</p>
      <h1 className="font-display text-2xl sm:text-3xl text-white mb-3 max-w-md">
        BIENTÔT DISPONIBLE
      </h1>
      <p className="text-[#888] text-sm font-sans mb-2 max-w-sm">
        Le coach n&apos;a pas encore activé les paiements pour cette session.
      </p>
      <p className="text-[#555] text-xs font-sans mb-8 max-w-sm">
        Session : {sessionTitle}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/explore" className="font-display-md text-xs tracking-[0.2em] border border-[#FF7A00]/40 text-[#FF7A00] px-8 py-3 hover:bg-[#FF7A00]/10 transition-colors">
          EXPLORER D&apos;AUTRES SESSIONS
        </Link>
      </div>
    </main>
  );
}

// ── Page principale ───────────────────────────────────────────────────────

export default async function BookingPage({ params }: Props) {
  const session = await db.session.findUnique({
    where: { id: params.sessionId },
    include: { coach: true },
  });

  // Session introuvable ou non publiée → 404
  if (!session || (session.status !== "published" && session.status !== "full")) {
    notFound();
  }

  // Plus de places disponibles
  const isFull = session.status === "full";

  // Guard : le coach n'a pas encore connecté Stripe
  if (!session.coach.stripeAccountId) {
    return <StripeNotReadyScreen sessionTitle={session.title} />;
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <div className="page-container pt-10">
        <div className="space-y-8">

          {/* En-tête */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#FF7A00]" />
              <span className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">RÉSERVATION</span>
            </div>
            <h1 className="font-display text-4xl text-white">
              T&apos;ES À 30 SECONDES
            </h1>
            <p className="text-[#555] text-sm">
              Juste ton prénom et ton email pour réserver ta place.
            </p>
          </div>

          {/* Récap session */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-4 space-y-2 text-sm">
            <p className="font-display text-white truncate">{session.title}</p>
            <p className="text-[#888] capitalize">
              📅 {formatSessionDateTime(session.dateStart, session.durationMin)}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[#888]">📍 {session.locationAddress}</p>
              <p className="font-display text-[#FF7A00] text-lg">{formatPrice(session.priceCents)}</p>
            </div>
            {isFull && (
              <p className="text-[#FF3D00] text-xs font-display-md tracking-widest">COMPLET</p>
            )}
          </div>

          {/* Formulaire ou message "complet" */}
          {isFull ? (
            <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 p-6 text-center space-y-3">
              <p className="font-display text-2xl text-white">SESSION COMPLÈTE</p>
              <p className="text-[#888] text-sm">Il n&apos;y a plus de place disponible.</p>
              <Link href="/explore" className="inline-block font-display-md text-xs tracking-[0.2em] text-[#FF7A00] hover:underline">
                EXPLORER D&apos;AUTRES SESSIONS →
              </Link>
            </div>
          ) : (
            <BookingForm sessionId={params.sessionId} />
          )}

          <p className="text-xs text-center text-[#555]">
            En continuant, tu acceptes les{" "}
            <a href="/legal/cgu" className="underline hover:text-[#FF7A00] transition-colors">CGU</a>{" "}
            et la{" "}
            <a href="/legal/privacy" className="underline hover:text-[#FF7A00] transition-colors">
              politique de confidentialité
            </a>
            .
          </p>

        </div>
      </div>
    </main>
  );
}
