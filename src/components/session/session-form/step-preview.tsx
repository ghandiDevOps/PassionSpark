import { DOMAIN_LABELS } from "@/constants";
import type { SessionFormData } from "./types";
import Image from "next/image";

interface Props {
  data: SessionFormData;
}

function formatEuros(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

export function StepPreview({ data }: Props) {
  const dateLabel = data.dateStr && data.timeStr
    ? new Date(`${data.dateStr}T${data.timeStr}`).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
        APERÇU DE TA SESSION
      </h2>
      <p className="text-[#666] text-sm font-sans mb-8">
        Voici ce que verront les participants. Vérifie tout avant de publier.
      </p>

      {/* Card aperçu */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden mb-6">

        {/* Image */}
        <div className="h-40 bg-[#2a2a2a] relative flex items-center justify-center overflow-hidden">
          {data.coverImageUrl ? (
            <Image 
              src={data.coverImageUrl} 
              alt="Preview" 
              fill 
              className="object-cover"
            />
          ) : (
            <span className="font-display text-[#333] text-sm tracking-widest">PHOTO À VENIR</span>
          )}
        </div>

        <div className="p-5">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <span className="badge-sport text-[10px] px-2 py-1">{data.category || data.domain}</span>
            <span className={data.sessionType === "discovery" ? "badge-discover" : "badge-progress"}>
              {data.sessionType === "discovery" ? "DÉCOUVERTE" : "PROGRESSION"}
            </span>
          </div>

          {/* Titre */}
          <h3 className="font-display text-2xl text-white leading-tight mb-3">
            {data.title || <span className="text-[#333]">Titre de la session</span>}
          </h3>

          {/* Compétence */}
          {data.skillFocus && (
            <p className="text-[#FF7A00] text-xs font-sans mb-3">
              🎯 {data.skillFocus}
            </p>
          )}

          {/* Infos */}
          <div className="space-y-1.5 mb-4 text-xs font-sans text-[#666]">
            <p>📅 {dateLabel} · {data.durationMin} min</p>
            <p>📍 {data.locationAddress || "Adresse non renseignée"}</p>
            <p>👥 {data.maxSpots} places max</p>
          </div>

          {/* Prix */}
          <div className="flex items-end justify-between">
            <div>
              <span className="font-display text-4xl text-[#FF7A00]">{formatEuros(data.priceCents)}</span>      
              <span className="font-display-md text-xs text-[#444] ml-1">/ pers.</span>
            </div>
            <span className="btn-passion text-xs px-4 py-2 min-h-0 opacity-50 cursor-not-allowed">
              RÉSERVER →
            </span>
          </div>
        </div>
      </div>

      {/* Récap complet */}
      <div className="space-y-2 text-xs font-sans">
        {[
          ["Type", data.sessionType === "discovery" ? "Découverte" : "Progression"],
          ["Domaine", DOMAIN_LABELS[data.domain] ?? data.domain],
          ["Catégorie", data.category],
          ["Titre", data.title],
          ["Compétence", data.skillFocus],
          ["Date", `${dateLabel} à ${data.timeStr}`],
          ["Durée", `${data.durationMin} minutes`],
          ["Lieu", data.locationAddress],
          ["Prix", formatEuros(data.priceCents) + " / personne"],
          ["Places", `${data.maxSpots} maximum`],
        ].map(([key, val]) => (
          <div key={key} className="flex gap-3 py-2 border-b border-[#1e1e1e]">
            <span className="font-display-md text-[#555] tracking-wider w-24 shrink-0">{key}</span>
            <span className={val ? "text-[#aaa]" : "text-[#333]"}>{val || "—"}</span>
          </div>
        ))}
      </div>

      <p className="text-[#555] text-xs font-sans mt-6 text-center">
        La session sera publiée immédiatement après confirmation.
      </p>
    </div>
  );
}
