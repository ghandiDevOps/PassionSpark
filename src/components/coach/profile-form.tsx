"use client";

import { useState } from "react";

interface Props {
  initialBio:      string | null;
  instagramUrl:    string | null;
  tiktokUrl:       string | null;
}

export function ProfileForm({ initialBio, instagramUrl, tiktokUrl }: Props) {
  const [bio,       setBio]       = useState(initialBio ?? "");
  const [instagram, setInstagram] = useState(instagramUrl ?? "");
  const [tiktok,    setTiktok]    = useState(tiktokUrl ?? "");
  const [saving,    setSaving]    = useState(false);
  const [status,    setStatus]    = useState<"idle" | "ok" | "error">("idle");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/coach/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          bio:          bio.trim() || undefined,
          instagramUrl: instagram.trim() || "",
          tiktokUrl:    tiktok.trim() || "",
        }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Bio */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="font-display-md text-[10px] tracking-widest block"
          style={{ color: "var(--color-muted)" }}
        >
          TA PHRASE DE PRÉSENTATION
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Ex : 8 ans de photo, j'enseigne la lumière naturelle aux débutants."
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 border focus:outline-none resize-none text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor:     "var(--color-border)",
            color:           "var(--color-text)",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(255,122,0,0.5)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; }}
        />
        <p className="text-[11px] text-right" style={{ color: "var(--color-muted)" }}>{bio.length}/200</p>
      </div>

      {/* Instagram */}
      <div className="space-y-2">
        <label
          htmlFor="instagram"
          className="font-display-md text-[10px] tracking-widest block"
          style={{ color: "var(--color-muted)" }}
        >
          INSTAGRAM (optionnel)
        </label>
        <input
          id="instagram"
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="https://instagram.com/toncompte"
          className="w-full px-4 py-3 border focus:outline-none text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor:     "var(--color-border)",
            color:           "var(--color-text)",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(255,122,0,0.5)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; }}
        />
      </div>

      {/* TikTok */}
      <div className="space-y-2">
        <label
          htmlFor="tiktok"
          className="font-display-md text-[10px] tracking-widest block"
          style={{ color: "var(--color-muted)" }}
        >
          TIKTOK (optionnel)
        </label>
        <input
          id="tiktok"
          type="url"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          placeholder="https://tiktok.com/@toncompte"
          className="w-full px-4 py-3 border focus:outline-none text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor:     "var(--color-border)",
            color:           "var(--color-text)",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(255,122,0,0.5)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; }}
        />
      </div>

      {/* Feedback */}
      {status === "ok" && (
        <p className="text-sm font-sans" style={{ color: "#10b981" }}>
          ✓ Profil mis à jour !
        </p>
      )}
      {status === "error" && (
        <p className="text-sm font-sans text-[#FF3D00]">
          Erreur lors de la sauvegarde. Réessaie.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full font-display-md text-[11px] tracking-[0.2em] text-black py-4 flame-gradient hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "SAUVEGARDE…" : "ENREGISTRER →"}
      </button>
    </form>
  );
}
