"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingActionsProps {
  booking: {
    id: string;
    amountPaidCents: number | null;
  };
}

export function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  async function doRefund() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setSuccess(true);
      setShowConfirm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded p-5">
        <p className="font-display-md text-[10px] tracking-wider text-green-400">REMBOURSEMENT INITIÉ</p>
        <p className="text-[#555] text-sm font-sans mt-1">Le remboursement Stripe a été traité.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 space-y-4">
      <h2 className="font-display-md text-[10px] tracking-wider text-[#444]">ACTIONS ADMIN</h2>

      {error && (
        <p className="text-red-400 text-sm font-sans bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="font-display-md text-[10px] tracking-wider text-yellow-400 border border-yellow-500/30 px-4 py-2 hover:bg-yellow-500/5 transition-colors disabled:opacity-40"
        >
          REMBOURSER {booking.amountPaidCents ? formatEur(booking.amountPaidCents) : ""}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-[#888] text-sm font-sans">
            Confirmer le remboursement de{" "}
            <strong className="text-white">{booking.amountPaidCents ? formatEur(booking.amountPaidCents) : "ce montant"}</strong>{" "}
            via Stripe ? Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <button
              onClick={doRefund}
              disabled={loading}
              className="font-display-md text-[10px] tracking-wider text-black bg-yellow-500 px-4 py-2 hover:bg-yellow-400 transition-colors disabled:opacity-40"
            >
              {loading ? "TRAITEMENT…" : "CONFIRMER LE REMBOURSEMENT"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="font-display-md text-[10px] tracking-wider text-[#555] border border-[#2a2a2a] px-4 py-2 hover:text-white transition-colors disabled:opacity-40"
            >
              ANNULER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
