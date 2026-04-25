"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchAction {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface ActionSearchBarProps {
  placeholder?: string;
  actions: SearchAction[];
  onSelect?: (action: SearchAction) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionSearchBar({
  placeholder = "Search...",
  actions,
  onSelect,
}: ActionSearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<SearchAction | null>(null);

  const filtered =
    query.trim() === ""
      ? actions
      : actions.filter(
          (a) =>
            a.label.toLowerCase().includes(query.toLowerCase()) ||
            a.description.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="w-full mx-auto">
      {/* Search input */}
      <div className="relative mb-3">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 text-sm py-3.5 pl-11 pr-4 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Domain tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((action, i) => (
            <motion.button
              key={action.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: i * 0.04 } }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.18)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedAction(action); onSelect?.(action); }}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-colors p-4 flex items-center gap-3 text-left"
            >
              <span className="text-2xl shrink-0">{action.icon}</span>
              <div className="min-w-0">
                <div className="text-white text-sm font-medium leading-tight">
                  {action.label}
                </div>
                <div className="text-white/50 text-xs mt-0.5 leading-snug">
                  {action.description}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 text-center text-white/30 text-sm py-6"
          >
            Aucun domaine trouvé
          </motion.div>
        )}
      </div>
    </div>
  );
}
