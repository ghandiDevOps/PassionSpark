"use client";

import { useState } from "react";
import Link from "next/link";
import { SessionCard, type SessionCardData } from "./session-card";

const PAGE_SIZE = 12;

// Univers principaux — style Manus
const UNIVERS_FILTERS = [
  { key: "TOUS",     label: "TOUS",      emoji: null },
  { key: "SPORTIF",  label: "🏃 SPORTIF", emoji: "🏃" },
  { key: "CRÉATIF",  label: "🎨 CRÉATIF", emoji: "🎨" },
];

interface ExploreClientProps {
  sessions: SessionCardData[];
  categories: string[];
}

export function ExploreClient({ sessions, categories }: ExploreClientProps) {
  const [activeUnivers, setActiveUnivers] = useState("TOUS");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  // Map domain values to univers
  function getUnivers(s: SessionCardData) {
    const d = s.domain?.toLowerCase() ?? "";
    if (["sport", "wellness"].includes(d)) return "SPORTIF";
    if (["music", "art", "cooking", "language", "business", "tech"].includes(d)) return "CRÉATIF";
    // Fallback: check category
    const c = s.category?.toLowerCase() ?? "";
    if (["trail", "running", "yoga", "escalade", "natation", "basket", "tennis", "fitness"].some(k => c.includes(k))) return "SPORTIF";
    return "CRÉATIF";
  }

  const filtered = sessions
    .filter(s => activeUnivers === "TOUS" || getUnivers(s) === activeUnivers)
    .filter(s => !activeCategory || s.category.toLowerCase() === activeCategory.toLowerCase());

  const visible  = filtered.slice(0, shown);
  const hasMore  = shown < filtered.length;
  const remaining = filtered.length - shown;

  function handleUnivers(u: string) {
    setActiveUnivers(u);
    setActiveCategory(null);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      {/* ── Filtres univers — style Manus "Atelier Minuit" ── */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide max-w-7xl">
          {UNIVERS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleUnivers(f.key)}
              className={`shrink-0 font-display-md text-xs px-5 py-2.5 transition-all duration-200 whitespace-nowrap cursor-pointer tracking-[0.15em] ${
                activeUnivers === f.key
                  ? "bg-[#FF7A00] text-black"
                  : "bg-[#1a1a1a] text-white hover:text-[#FF7A00]"
              }`}
            >
              {f.label}
            </button>
          ))}
          {/* Séparateur + filtres catégorie secondaire */}
          {categories.length > 0 && (
            <>
              <div className="w-px bg-[#1e1e1e] mx-2 self-stretch" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(activeCategory === cat ? null : cat);
                    setShown(PAGE_SIZE);
                  }}
                  className={`shrink-0 font-sans text-xs px-4 py-2.5 border transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? "border-[#FF7A00]/60 text-[#FF7A00]"
                      : "border-[#1e1e1e] text-[#333] hover:border-[#FF7A00]/30 hover:text-[#555]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Compteur ── */}
      <p className="text-[#444] text-sm font-sans mb-6">
        <span className="text-white font-semibold">{filtered.length}</span>{" "}
        session{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
        {activeUnivers !== "TOUS" && (
          <span className="text-[#FF7A00]"> · {activeUnivers}</span>
        )}
        {activeCategory && (
          <span className="text-[#FF7A00]"> · {activeCategory}</span>
        )}
      </p>

      {/* ── État vide ── */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="font-display text-4xl text-[#1e1e1e] mb-3">AUCUNE SESSION</p>
          <p className="text-[#444] text-sm font-sans mb-6">
            Pas encore de sessions {activeUnivers !== "TOUS" ? activeUnivers.toLowerCase() : ""} disponibles.
          </p>
          <button
            onClick={() => handleUnivers("TOUS")}
            className="font-display-md text-xs text-[#FF7A00] hover:text-white transition-colors"
          >
            VOIR TOUTES LES SESSIONS →
          </button>
        </div>
      )}

      {/* ── Grille sessions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {visible.map((s) => (
          <SessionCard key={s.slug} s={s} />
        ))}
      </div>

      {/* ── Voir plus ── */}
      {hasMore && (
        <div className="flex flex-col items-center gap-2 mb-12">
          <button
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="font-display-md text-[11px] tracking-[0.2em] text-black px-10 py-4 flame-gradient hover:opacity-90 transition-opacity"
          >
            VOIR PLUS — {remaining} SESSION{remaining > 1 ? "S" : ""}
          </button>
          <p className="text-[#555] text-xs font-sans">
            {shown} / {filtered.length} affichées
          </p>
        </div>
      )}

      {/* ── Bannière coach — style Manus "POUR LES PASSEURS" ── */}
      <div className="bg-[#111] border border-[#1e1e1e] p-8 lg:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-4">
        <div>
          <span className="font-display-md text-xs text-[#FF7A00] tracking-[0.25em] block mb-3">
            POUR LES PASSEURS
          </span>
          <h3 className="font-display text-3xl sm:text-4xl text-white leading-[0.9] mb-2">
            Vous avez une passion.
          </h3>
          <p className="text-[#444] text-sm font-sans max-w-sm">
            Créez votre session en 5 minutes. 70% des revenus vous reviennent. Aucun frais d'entrée.
          </p>
        </div>
        <Link
          href="/devenir-coach"
          className="btn-passion whitespace-nowrap shrink-0 sm:px-10 text-sm"
        >
          DEVENIR COACH →
        </Link>
      </div>
    </>
  );
}
