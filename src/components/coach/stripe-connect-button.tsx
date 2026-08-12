"use client";

import { useState } from "react";

interface Props {
  /** Si défini, le coach a déjà un compte mais n'a pas terminé l'onboarding Stripe */
  incomplete?: boolean;
  /** Texte du bouton. Si omis, utilise "ACTIVER →" ou "REPRENDRE →" selon `incomplete` */
  label?: string;
}

/**
 * Bouton "ACTIVER →" du dashboard coach.
 * Appelle POST /api/coach/stripe-connect → redirige vers l'URL Stripe Express.
 */
export function StripeConnectButton({ incomplete, label }: Props) {
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
        return; // redirect in progress, no setLoading(false)
      }

      // Erreurs connues
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
    <div className="space-y-1">
      <button
        onClick={handleActivate}
        disabled={loading}
        className="font-display-md text-[10px] tracking-[0.2em] text-[#FF7A00] border border-[#FF7A00]/40 px-4 py-2 hover:bg-[#FF7A00]/10 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "CONNEXION…" : (label ?? (incomplete ? "REPRENDRE →" : "ACTIVER →"))}
      </button>
      {error && (
        <p className="text-[10px] text-[#FF3D00] font-sans">{error}</p>
      )}
    </div>
  );
}
