"use client";

import { useState, useRef, useEffect } from "react";
import { useBanAutocomplete } from "@/hooks/use-ban-autocomplete";
import type { SessionFormData } from "./types";

interface Props {
  data: SessionFormData;
  onChange: (patch: Partial<SessionFormData>) => void;
}

export function StepLocation({ data, onChange }: Props) {
  const [query, setQuery]   = useState(data.locationAddress);
  const [open, setOpen]     = useState(false);
  const wrapperRef          = useRef<HTMLDivElement>(null);
  const { results, loading, error } = useBanAutocomplete(query);

  const hasCoords = data.locationLat !== 0 && data.locationLng !== 0;
  const isStale   = hasCoords && query !== data.locationAddress;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(feature: typeof results[number]) {
    onChange({
      locationAddress: feature.label,
      locationLat:     feature.lat,
      locationLng:     feature.lng,
    });
    setQuery(feature.label);
    setOpen(false);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (data.locationAddress) {
      onChange({ locationAddress: value, locationLat: 0, locationLng: 0 });
    } else {
      onChange({ locationAddress: value });
    }
  }

  // Bbox pour iframe OSM : ~500m autour du point
  const delta = 0.005;
  const bbox  = hasCoords
    ? `${data.locationLng - delta},${data.locationLat - delta},${data.locationLng + delta},${data.locationLat + delta}`
    : null;

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
        OÙ ÇA SE PASSE ?
      </h2>
      <p className="text-[#666] text-sm font-sans mb-8">
        Recherche l&apos;adresse exacte du lieu. Sélectionne une suggestion pour valider.
      </p>

      <div className="space-y-6">

        {/* Recherche d'adresse */}
        <div ref={wrapperRef} className="relative">
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            ADRESSE
          </label>
          <input
            type="text"
            placeholder="Ex : 12 rue des Arènes, Paris"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            maxLength={200}
            autoComplete="off"
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white text-sm font-sans px-4 py-3 focus:outline-none focus:border-[#FF7A00] placeholder-[#444] transition-colors"
          />

          {/* État sous l'input */}
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[#444] text-xs font-sans">
              {loading && "Recherche..."}
              {error && <span className="text-[#FF3D00]">{error}</span>}
              {!loading && !error && hasCoords && !isStale && (
                <span className="text-[#10b981]">✓ Adresse géolocalisée</span>
              )}
              {!loading && !error && isStale && (
                <span className="text-[#FFB700]">Modifie pour relancer la recherche</span>
              )}
            </p>
            <p className="text-[#444] text-xs font-sans">{query.length}/200</p>
          </div>

          {/* Dropdown suggestions */}
          {open && results.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#2a2a2a] max-h-72 overflow-y-auto shadow-xl">
              {results.map((r, i) => (
                <button
                  key={`${r.label}-${i}`}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00] border-b border-[#1a1a1a] last:border-b-0 transition-colors"
                >
                  <p className="text-white text-sm font-sans leading-tight">{r.label}</p>
                  <p className="text-[#555] text-xs font-sans mt-0.5">
                    {r.postcode} {r.city}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Carte preview */}
        {hasCoords && !isStale && bbox && (
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden">
            <p className="font-display-md text-xs text-[#888] tracking-widest px-4 pt-3 pb-2">
              APERÇU
            </p>
            <iframe
              title="Carte du lieu"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${data.locationLat},${data.locationLng}`}
              className="w-full h-56 border-0"
              loading="lazy"
            />
            <div className="px-4 py-3 flex items-start gap-3 border-t border-[#2a2a2a]">
              <div className="w-1 self-stretch bg-[#FF7A00] shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-sans break-words">{data.locationAddress}</p>
                <p className="text-[#555] text-xs font-sans mt-1">
                  {data.locationLat.toFixed(5)}, {data.locationLng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Note source données */}
        <p className="text-[#333] text-[10px] font-sans">
          Données : Base Adresse Nationale (data.gouv.fr) · Carte : OpenStreetMap
        </p>
      </div>
    </div>
  );
}
