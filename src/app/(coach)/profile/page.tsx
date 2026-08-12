import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/coach/profile-form";
import { StripeConnectButton } from "@/components/coach/stripe-connect-button";
import { DOMAIN_LABELS, DOMAIN_EMOJIS } from "@/constants";

export const metadata = { title: "Mon profil · Passion Spark" };

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) redirect("/onboarding");

  const cp = user.coachProfile;

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 space-y-10"
      style={{ color: "var(--color-text)" }}
    >
      {/* ── Header ── */}
      <div className="space-y-1">
        <p className="font-display-md text-[10px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          MON PROFIL
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            className="font-display leading-none"
            style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)" }}
          >
            {user.name.toUpperCase().split(" ")[0]}.
          </h1>
          <Link
            href="/dashboard"
            className="shrink-0 font-display-md text-[10px] tracking-[0.2em] hover:text-[#FF7A00] transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            ← DASHBOARD
          </Link>
        </div>
      </div>

      <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />

      {/* ── Identité ── */}
      <div
        className="border p-5 space-y-3"
        style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
          IDENTITÉ
        </p>
        <div className="space-y-1">
          <p className="text-sm font-sans" style={{ color: "var(--color-text)" }}>{user.name}</p>
          <p className="text-xs font-sans" style={{ color: "var(--color-muted)" }}>{user.email}</p>
        </div>
      </div>

      {/* ── Domaines ── */}
      {cp.domains.length > 0 && (
        <div
          className="border p-5 space-y-3"
          style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
        >
          <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
            DOMAINES
          </p>
          <div className="flex flex-wrap gap-2">
            {cp.domains.map((d) => (
              <span
                key={d}
                className="font-display-md text-[10px] tracking-widest px-3 py-1.5 border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                {DOMAIN_EMOJIS[d] ?? ""} {(DOMAIN_LABELS[d] ?? d).toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-xs font-sans" style={{ color: "var(--color-muted)" }}>
            Pour changer de domaine, passe par l&apos;
            <Link href="/onboarding" className="underline hover:text-[#FF7A00] transition-colors">
              onboarding
            </Link>
            .
          </p>
        </div>
      )}

      {/* ── Stripe ── */}
      <div
        className="border p-5 space-y-3"
        style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
          PAIEMENTS STRIPE
        </p>
        {cp.stripeOnboardingStatus === "active" ? (
          <div className="flex items-center gap-2">
            <span className="text-base">✅</span>
            <span className="font-display-md text-[10px] tracking-widest text-[#10b981]">ACTIVÉ</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span className="font-display-md text-[10px] tracking-widest text-[#FF7A00]">
                {cp.stripeOnboardingStatus === "pending" ? "EN COURS" : "NON CONFIGURÉ"}
              </span>
            </div>
            <p className="text-xs font-sans" style={{ color: "var(--color-muted)" }}>
              Active Stripe pour recevoir tes revenus et permettre les réservations.
            </p>
            <StripeConnectButton incomplete={cp.stripeOnboardingStatus === "pending"} />
          </div>
        )}
      </div>

      {/* ── Éditeur de profil ── */}
      <div
        className="border p-5 space-y-6"
        style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      >
        <p className="font-display-md text-[9px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
          PRÉSENTATION
        </p>
        <ProfileForm
          initialBio={cp.bio}
          instagramUrl={cp.instagramUrl}
          tiktokUrl={cp.tiktokUrl}
        />
      </div>

      {/* ── Stats ── */}
      {cp.totalSessions > 0 && (
        <div
          className="border grid grid-cols-2 divide-x"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}
        >
          <div className="p-5 text-center" style={{ borderColor: "var(--color-border)" }}>
            <p className="font-display text-4xl text-[#FF7A00]">{cp.totalSessions}</p>
            <p className="font-display-md text-[9px] tracking-widest mt-1" style={{ color: "var(--color-muted)" }}>SESSIONS</p>
          </div>
          <div className="p-5 text-center">
            <p className="font-display text-4xl" style={{ color: cp.avgRating > 0 ? "#FFB700" : "var(--color-border)" }}>
              {cp.avgRating > 0 ? cp.avgRating.toFixed(1) : "—"}
            </p>
            <p className="font-display-md text-[9px] tracking-widest mt-1" style={{ color: "var(--color-muted)" }}>NOTE / 5</p>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
