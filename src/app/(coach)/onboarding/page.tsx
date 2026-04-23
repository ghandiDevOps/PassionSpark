"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Step = 1 | 2;

const DOMAINS = [
  {
    value: "sport",
    label: "Sport",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M4.93 4.93 19.07 19.07"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    ),
  },
  {
    value: "music",
    label: "Musique",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    value: "cooking",
    label: "Cuisine",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
  },
  {
    value: "language",
    label: "Langue",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/>
        <path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
    ),
  },
  {
    value: "business",
    label: "Business",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/>
        <line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
      </svg>
    ),
  },
  {
    value: "art",
    label: "Art",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
  },
  {
    value: "other",
    label: "Autre",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDomain = (value: string) => {
    setSelectedDomains((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleProfileSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: selectedDomains, bio: bio.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du profil");
      setStep(2);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeConnect = async () => {
    setIsStripeLoading(true);
    try {
      const res = await fetch("/api/coach/stripe-connect", { method: "POST" });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setIsStripeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <div className="page-container pt-10 pb-16 max-w-lg">

        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {([1, 2] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-0.5 flex-1 transition-colors duration-300 ${s <= step ? "bg-[#FF7A00]" : "bg-[#2a2a2a]"}`}
            />
          ))}
        </div>

        {/* ─── ÉTAPE 1 : Domaine + bio ─── */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-up">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#FF7A00]" />
                <span className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">1 / 2</span>
              </div>
              <h1 className="font-display text-4xl text-white leading-tight">
                DANS QUOI<br />TU EXCELLES ?
              </h1>
              <p className="text-[#555] mt-2 text-sm">
                Choisis un ou plusieurs domaines. Tu pourras en ajouter plus tard.
              </p>
            </div>

            {/* Domain grid */}
            <div className="grid grid-cols-2 gap-2">
              {DOMAINS.map(({ value, label, icon }) => {
                const active = selectedDomains.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleDomain(value)}
                    className={`group flex items-center gap-3 p-4 border text-left transition-all duration-150 ${
                      active
                        ? "border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]"
                        : "border-[#2a2a2a] bg-[#1e1e1e] text-[#555] hover:border-[#FF7A00]/40 hover:text-white"
                    }`}
                  >
                    <span className="shrink-0">{icon}</span>
                    <span className="font-display text-sm">{label.toUpperCase()}</span>
                    {active && (
                      <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bio optionnelle */}
            <div className="space-y-2">
              <label className="font-display-md text-[10px] tracking-wider text-[#444] block">
                TA PHRASE DE PRÉSENTATION <span className="text-[#2a2a2a] font-sans normal-case tracking-normal">— optionnel</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex : 12 ans de MMA, j'enseigne la défense et la frappe aux débutants."
                maxLength={200}
                rows={2}
                className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] text-white
                           placeholder:text-[#333] focus:outline-none focus:border-[#FF7A00]/50
                           resize-none text-sm transition-colors"
              />
              <p className="text-[11px] text-right text-[#333]">{bio.length}/200</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-sans bg-red-500/5 border border-red-500/20 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              onClick={handleProfileSave}
              disabled={selectedDomains.length === 0}
              loading={isSubmitting}
              fullWidth
            >
              Continuer →
            </Button>
          </div>
        )}

        {/* ─── ÉTAPE 2 : Stripe Connect ─── */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-up">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#FF7A00]" />
                <span className="font-display-md text-xs text-[#FF7A00] tracking-[0.2em]">2 / 2</span>
              </div>
              <h1 className="font-display text-4xl text-white leading-tight">
                REÇOIS TES<br />PAIEMENTS
              </h1>
              <p className="text-[#555] mt-2 text-sm leading-relaxed">
                On utilise Stripe pour virer tes gains directement sur ton compte. Rapide, sécurisé, standard dans l'industrie.
              </p>
            </div>

            {/* Infos Stripe */}
            <div className="border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  ),
                  text: "Sécurisé — Stripe gère des milliards de transactions par an.",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  ),
                  text: "Prépare ton IBAN et une pièce d'identité — 3 minutes maxi.",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  ),
                  text: "Virements chaque lundi pour les sessions de la semaine passée.",
                },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-3.5">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <p className="text-sm text-[#888]">{text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button onClick={handleStripeConnect} loading={isStripeLoading} fullWidth>
                Connecter mon compte bancaire →
              </Button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full text-sm text-[#444] text-center hover:text-[#777] transition-colors py-1"
              >
                Passer pour l'instant — je le ferai plus tard
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
