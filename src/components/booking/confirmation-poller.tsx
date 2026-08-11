"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  participantName: string;
}

// Affiche un spinner tant que le booking est "pending", puis déclenche un
// router.refresh() dès "confirmed" — la page de confirmation (Server Component)
// re-fetch alors le booking et affiche le vrai QR. Cet endpoint ne renvoie jamais
// le qrToken lui-même (voir api/bookings/[id]/status/route.ts).
// Gère la fenêtre entre le redirect Stripe et le traitement du webhook (~1-3s)
export function ConfirmationPoller({ bookingId, participantName }: Props) {
  const router               = useRouter();
  const [failed, setFailed]  = useState(false);
  const MAX_ATTEMPTS          = 12; // 12 × 1s = 12s max

  useEffect(() => {
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const res  = await fetch(`/api/bookings/${bookingId}/status`);
        const data = await res.json();

        if (data.status === "confirmed" || data.status === "attended") {
          router.refresh();
          return;
        }
      } catch {
        // réseau : on retente
      }

      if (attempts >= MAX_ATTEMPTS) {
        setFailed(true);
        return;
      }

      setTimeout(poll, 1000);
    };

    poll();
  }, [bookingId, router]);

  if (failed) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 text-center space-y-2">
          <p className="text-[#888] text-sm">
            Le QR code sera envoyé par email dans quelques instants.
          </p>
          <p className="text-xs text-[#555]">
            Rafraîchis la page dans 30 secondes si tu ne l'as pas reçu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-8 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm">Génération de ton QR code…</p>
      </div>
      <p className="text-xs text-[#555] text-center">{participantName}</p>
    </div>
  );
}
