"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = 1 | 2 | 3;

const DOMAINS = [
  { value: "sport",    label: "Sport",    emoji: "🥊" },
  { value: "music",    label: "Musique",  emoji: "🎸" },
  { value: "cooking",  label: "Cuisine",  emoji: "🍳" },
  { value: "language", label: "Langue",   emoji: "🌍" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "art",      label: "Art",      emoji: "🎨" },
  { value: "other",    label: "Autre",    emoji: "✨" },
];

const STEPS = [
  { n: 1, label: "Domaine" },
  { n: 2, label: "Profil"  },
  { n: 3, label: "Go !"    },
];

// ── Bouton Stripe (appel API interne) ────────────────────────────────────────
function ActivateStripeButton({ label = "ACTIVER STRIPE ET RECEVOIR VOS PAIEMENTS →" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleActivate() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/coach/stripe-connect", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === "EMAIL_NOT_VERIFIED") {
        setError("Vérifie ton adresse email avant d'activer les paiements.");
      } else {
        setError("Impossible de lancer l'activation. Réessaie dans un instant.");
      }
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full font-display-md text-[11px] tracking-[0.2em] text-black py-5 flame-gradient hover:opacity-90 transition-opacity disabled:opacity-50 pulse-orange"
      >
        {loading ? "CONNEXION À STRIPE…" : label}
      </button>
      {error && (
        <p className="text-xs text-[#FF3D00] font-sans text-center">{error}</p>
      )}
    </div>
  );
}

// ── Écran retour Stripe (success ou refresh) ─────────────────────────────────
function StripeReturnScreen({ success }: { success: boolean }) {
  const router = useRouter();
  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-md mx-auto px-5 pt-10 pb-20 space-y-8">

        <div className="w-12 h-12 border-2 flex items-center justify-center"
          style={{ borderColor: success ? "#10b981" : "#FF7A00" }}
        >
          {success ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <span style={{ color: "#FF7A00", fontSize: 20 }}>↻</span>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-display-md text-[10px] tracking-[0.3em]"
            style={{ color: success ? "#10b981" : "#FF7A00" }}
          >
            {success ? "STRIPE ACTIVÉ" : "FINALISATION REQUISE"}
          </p>
          <h1 className="font-display leading-[0.9]" style={{ fontSize: "clamp(2rem, 8vw, 3rem)", color: "var(--color-text)" }}>
            {success
              ? <>PAIEMENTS<br /><span className="flame-text">ACTIVÉS !</span></>
              : <>PRESQUE<br /><span className="flame-text">TERMINÉ.</span></>
            }
          </h1>
          <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
            {success
              ? "Ton compte Stripe est configuré. Tu peux maintenant créer tes sessions et recevoir des paiements."
              : "Ta session Stripe a expiré. Relance le processus pour finaliser la configuration."
            }
          </p>
        </div>

        {success ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/sessions/new")}
              className="w-full font-display-md text-[11px] tracking-[0.2em] text-black py-5 flame-gradient hover:opacity-90 transition-opacity"
            >
              CRÉER MA PREMIÈRE SESSION →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-sm font-sans py-2 transition-colors"
              style={{ color: "var(--color-muted)" }}
            >
              Voir mon dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <ActivateStripeButton label="REPRENDRE LA CONFIGURATION STRIPE →" />
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-sm font-sans py-2 transition-colors"
              style={{ color: "var(--color-muted)" }}
            >
              Continuer sans Stripe pour l'instant
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Page principale (avec lecture des searchParams) ──────────────────────────
function OnboardingContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep]               = useState<Step>(1);
  const [selectedDomain, setDomain]   = useState<string>("");
  const [bio, setBio]                 = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Retour depuis Stripe → affiche l'écran approprié
  const stripeSuccess = searchParams.get("stripe_success") === "true";
  const stripeRefresh = searchParams.get("stripe_refresh") === "true";

  if (stripeSuccess) return <StripeReturnScreen success={true} />;
  if (stripeRefresh)  return <StripeReturnScreen success={false} />;

  // ── Étape 2 : sauvegarder le profil ──────────────────────────────────────
  async function saveProfile() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ domains: [selectedDomain], bio: bio.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur serveur");
      }
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-md mx-auto px-5 pt-10 pb-20">

        {/* ── Barre de progression ── */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-6 h-6 shrink-0 border transition-colors duration-300 ${
                s.n < step  ? "bg-[#FF7A00] border-[#FF7A00]" :
                s.n === step ? "border-[#FF7A00]" :
                "border-[#2a2a2a]"
              }`}>
                {s.n < step
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span className="font-display-md text-[9px]" style={{ color: s.n === step ? "#FF7A00" : "var(--color-muted)" }}>{s.n}</span>
                }
              </div>
              <span className="font-display-md text-[9px] tracking-widest" style={{ color: s.n === step ? "#FF7A00" : "var(--color-muted)" }}>
                {s.label.toUpperCase()}
              </span>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1" style={{ backgroundColor: s.n < step ? "#FF7A00" : "var(--color-border)" }} />
              )}
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            ÉTAPE 1 — Choix du domaine
        ════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="font-display-md text-[10px] tracking-[0.3em] text-[#FF7A00]">ÉTAPE 1 / 3</p>
              <h1 className="font-display leading-[0.9]" style={{ fontSize: "clamp(2rem, 8vw, 3rem)", color: "var(--color-text)" }}>
                DANS QUOI<br />TU EXCELLES ?
              </h1>
              <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
                Choisis ton domaine principal. Tu pourras en ajouter d'autres plus tard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DOMAINS.map(({ value, label, emoji }) => {
                const active = selectedDomain === value;
                return (
                  <button
                    key={value}
                    onClick={() => setDomain(value)}
                    className="flex items-center gap-4 px-4 py-3.5 border text-left transition-all duration-150 cursor-pointer"
                    style={{
                      borderColor:     active ? "#FF7A00" : "var(--color-border)",
                      backgroundColor: active ? "rgba(255,122,0,0.08)" : "var(--color-bg-card)",
                      color:           active ? "#FF7A00" : "var(--color-text)",
                    }}
                  >
                    <span className="text-xl w-7 shrink-0">{emoji}</span>
                    <span className="font-display text-base">{label.toUpperCase()}</span>
                    {active && (
                      <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedDomain && setStep(2)}
              disabled={!selectedDomain}
              className="w-full font-display-md text-[11px] tracking-[0.2em] text-black py-4 flame-gradient hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CONTINUER →
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 2 — Bio + sauvegarde
        ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="font-display-md text-[10px] tracking-[0.3em] text-[#FF7A00]">ÉTAPE 2 / 3</p>
              <h1 className="font-display leading-[0.9]" style={{ fontSize: "clamp(2rem, 8vw, 3rem)", color: "var(--color-text)" }}>
                EN DEUX<br />MOTS.
              </h1>
              <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
                Une phrase sur toi — optionnel, tu peux le faire plus tard.
              </p>
            </div>

            {/* Domaine sélectionné — recap */}
            <div className="flex items-center gap-3 border-l-2 border-[#FF7A00] pl-4">
              <span className="text-xl">{DOMAINS.find(d => d.value === selectedDomain)?.emoji}</span>
              <div>
                <p className="font-display-md text-[9px] tracking-widest" style={{ color: "var(--color-muted)" }}>DOMAINE CHOISI</p>
                <p className="font-display text-lg" style={{ color: "var(--color-text)" }}>
                  {DOMAINS.find(d => d.value === selectedDomain)?.label.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto font-display-md text-[9px] tracking-widest hover:text-[#FF7A00] transition-colors"
                style={{ color: "var(--color-muted)" }}
              >
                CHANGER
              </button>
            </div>

            <div className="space-y-2">
              <label className="font-display-md text-[10px] tracking-widest block" style={{ color: "var(--color-muted)" }}>
                TA PHRASE DE PRÉSENTATION
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={"Ex : 12 ans de MMA, j'enseigne la défense et la frappe aux débutants."}
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 border focus:outline-none resize-none text-sm transition-colors"
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  borderColor:     "var(--color-border)",
                  color:           "var(--color-text)",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(255,122,0,0.5)"; }}
                onBlur={e =>  { e.target.style.borderColor = "var(--color-border)"; }}
              />
              <p className="text-[11px] text-right" style={{ color: "var(--color-muted)" }}>{bio.length}/200</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-sans border border-red-500/20 px-3 py-2 bg-red-500/5">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-4 border font-display-md text-[10px] tracking-widest transition-colors hover:border-[#FF7A00]/40"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                ←
              </button>
              <button
                onClick={saveProfile}
                disabled={isSubmitting}
                className="flex-1 font-display-md text-[11px] tracking-[0.2em] text-black py-4 flame-gradient hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? "ENREGISTREMENT…" : "CRÉER MON PROFIL →"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 3 — Go ! + Activation Stripe
        ════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Succès profil */}
            <div className="space-y-3">
              <div className="w-12 h-12 border-2 border-[#FF7A00] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="font-display-md text-[10px] tracking-[0.3em] text-[#FF7A00]">PROFIL CRÉÉ</p>
              <h1 className="font-display leading-[0.9]" style={{ fontSize: "clamp(2rem, 8vw, 3rem)", color: "var(--color-text)" }}>
                C'EST PARTI.<br />
                <span className="flame-text">UNE ÉTAPE CLÉE.</span>
              </h1>
              <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
                Active Stripe maintenant pour recevoir tes paiements dès ta première réservation. Ça prend 3 minutes.
              </p>
            </div>

            {/* Stats */}
            <div className="border divide-y" style={{ borderColor: "var(--color-border)" }}>
              {[
                { n: "70%",  label: "des revenus directement sur ton compte" },
                { n: "3min", label: "pour configurer Stripe" },
                { n: "2–20", label: "participants par session" },
              ].map(({ n, label }) => (
                <div key={label} className="flex items-center gap-4 px-4 py-3" style={{ backgroundColor: "var(--color-bg-card)" }}>
                  <span className="font-display text-2xl text-[#FF7A00] w-14 shrink-0">{n}</span>
                  <span className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA Stripe — PRIMARY */}
            <ActivateStripeButton />

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
              <span className="font-display-md text-[9px] tracking-widest" style={{ color: "var(--color-muted)" }}>OU</span>
              <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            </div>

            {/* CTA secondaire : créer session d'abord */}
            <div className="space-y-2">
              <button
                onClick={() => router.push("/sessions/new")}
                className="w-full font-display-md text-[10px] tracking-[0.2em] py-4 border transition-colors hover:border-[#FF7A00]/40 hover:text-[#FF7A00]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                CRÉER UNE SESSION D'ABORD →
              </button>
              <p className="text-xs text-center font-sans" style={{ color: "var(--color-muted)" }}>
                Tu pourras activer Stripe depuis ton dashboard avant ta première session.
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// ── Export (Suspense requis pour useSearchParams) ────────────────────────────
export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
