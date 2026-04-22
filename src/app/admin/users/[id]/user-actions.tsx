"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  user: {
    id: string;
    role: string;
    bannedAt: Date | null;
    bannedReason: string | null;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [showBanForm, setShowBanForm] = useState(false);

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      router.refresh();
      setShowBanForm(false);
      setBanReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded p-5 space-y-4">
      <h2 className="font-display-md text-[10px] tracking-wider text-[#444]">ACTIONS ADMIN</h2>

      {error && (
        <p className="text-red-400 text-sm font-sans bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Ban / Unban */}
        {user.bannedAt ? (
          <button
            onClick={() => doAction("unban")}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-green-400 border border-green-500/30 px-4 py-2 hover:bg-green-500/5 transition-colors disabled:opacity-40"
          >
            DÉBANNIR
          </button>
        ) : (
          <button
            onClick={() => setShowBanForm(true)}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-red-400 border border-red-500/30 px-4 py-2 hover:bg-red-500/5 transition-colors disabled:opacity-40"
          >
            BANNIR
          </button>
        )}

        {/* Change role */}
        {user.role !== "coach" && user.role !== "admin" && (
          <button
            onClick={() => doAction("change_role", { newRole: "coach" })}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-blue-400 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/5 transition-colors disabled:opacity-40"
          >
            PROMOUVOIR COACH
          </button>
        )}
        {user.role === "coach" && (
          <button
            onClick={() => doAction("change_role", { newRole: "participant" })}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-[#555] border border-[#2a2a2a] px-4 py-2 hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
          >
            RÉTROGRADER PARTICIPANT
          </button>
        )}
        {user.role !== "admin" && (
          <button
            onClick={() => {
              if (confirm("Promouvoir en admin ? Cette action est irréversible sans accès DB direct.")) {
                doAction("change_role", { newRole: "admin" });
              }
            }}
            disabled={loading}
            className="font-display-md text-[10px] tracking-wider text-red-400 border border-red-500/20 px-4 py-2 hover:bg-red-500/5 transition-colors disabled:opacity-40"
          >
            PROMOUVOIR ADMIN
          </button>
        )}
      </div>

      {/* Ban form */}
      {showBanForm && (
        <div className="space-y-3">
          <input
            type="text"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Raison du bannissement (visible admin uniquement)…"
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder-[#333] text-sm font-sans px-3 py-2 focus:outline-none focus:border-red-500/40"
          />
          <div className="flex gap-2">
            <button
              onClick={() => doAction("ban", { reason: banReason })}
              disabled={loading || !banReason.trim()}
              className="font-display-md text-[10px] tracking-wider text-black bg-red-500 px-4 py-2 hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              CONFIRMER LE BAN
            </button>
            <button
              onClick={() => { setShowBanForm(false); setBanReason(""); }}
              className="font-display-md text-[10px] tracking-wider text-[#555] border border-[#2a2a2a] px-4 py-2 hover:text-white transition-colors"
            >
              ANNULER
            </button>
          </div>
        </div>
      )}

      {/* Ban info */}
      {user.bannedAt && user.bannedReason && (
        <p className="text-[#555] text-xs font-sans">
          Raison : {user.bannedReason} · Banni le {new Date(user.bannedAt).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  );
}
