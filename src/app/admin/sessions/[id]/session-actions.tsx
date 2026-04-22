"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SessionActionsProps {
  session: {
    id: string;
    status: string;
    cancellationReason: string | null;
  };
}

export function SessionActions({ session }: SessionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      router.refresh();
      setShowCancelForm(false);
      setCancelReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const canPublish = session.status === "draft";
  const canUnpublish = ["published", "full"].includes(session.status);
  const canCancel = !["cancelled", "completed"].includes(session.status);

  return (
    <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 space-y-4">
      <h2 className="font-display-md text-[10px] tracking-wider text-[#444]">ACTIONS ADMIN</h2>

      {error && (
        <p className="text-red-400 text-sm font-sans bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canUnpublish && (
          <button
            onClick={() => doAction("unpublish")}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-yellow-400 border border-yellow-500/30 px-4 py-2 hover:bg-yellow-500/5 transition-colors disabled:opacity-40"
          >
            DÉPUBLIER
          </button>
        )}
        {canPublish && (
          <button
            onClick={() => doAction("publish")}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-green-400 border border-green-500/30 px-4 py-2 hover:bg-green-500/5 transition-colors disabled:opacity-40"
          >
            PUBLIER
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelForm(true)}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-red-400 border border-red-500/30 px-4 py-2 hover:bg-red-500/5 transition-colors disabled:opacity-40"
          >
            ANNULER LA SESSION
          </button>
        )}
      </div>

      {showCancelForm && (
        <div className="space-y-3">
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Raison d'annulation (visible aux participants)…"
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder-[#333] text-sm font-sans px-3 py-2 focus:outline-none focus:border-red-500/40"
          />
          <div className="flex gap-2">
            <button
              onClick={() => doAction("cancel", { reason: cancelReason })}
              disabled={loading || !cancelReason.trim()}
              className="font-display-md text-[10px] tracking-wider text-black bg-red-500 px-4 py-2 hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              CONFIRMER L'ANNULATION
            </button>
            <button
              onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
              className="font-display-md text-[10px] tracking-wider text-[#555] border border-[#2a2a2a] px-4 py-2 hover:text-white transition-colors"
            >
              ANNULER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
