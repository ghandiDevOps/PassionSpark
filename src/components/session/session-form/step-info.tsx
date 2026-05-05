import { DOMAIN_LABELS, DOMAIN_EMOJIS } from "@/constants";
import type { SessionFormData } from "./types";
import { CoverImageUpload } from "./cover-image-upload";

interface Props {
  data: SessionFormData;
  onChange: (patch: Partial<SessionFormData>) => void;
}

const DOMAINS = ["sport", "music", "cooking", "language", "business", "art", "other"] as const;

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  sport:    ["Football", "Basket", "MMA", "Padel", "Boxe", "Tennis", "Yoga", "Natation", "Surf", "Escalade"],   
  music:    ["Guitare", "Piano", "Chant", "Batterie", "DJ", "Production"],
  cooking:  ["Pâtisserie", "Sushi", "Cuisine italienne", "Barbecue", "Vegan"],
  language: ["Anglais", "Espagnol", "Arabe", "Japonais", "Mandarin"],
  business: ["Pitch", "Négociation", "Leadership", "Marketing", "Finance"],
  art:      ["Dessin", "Aquarelle", "Photographie", "Céramique", "Street art"],
  other:    [],
};

export function StepInfo({ data, onChange }: Props) {
  const suggestions = CATEGORY_SUGGESTIONS[data.domain] ?? [];

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
        TA SESSION EN DÉTAIL
      </h2>
      <p className="text-[#666] text-sm font-sans mb-8">
        Sois précis — les participants choisissent sur la base de ces infos.
      </p>

      <div className="space-y-8">
        
        {/* Image de couverture */}
        <CoverImageUpload 
          value={data.coverImageUrl} 
          onChange={(url) => onChange({ coverImageUrl: url })} 
        />

        <div className="h-px bg-[#2a2a2a]" />

        {/* Domaine */}
        <div>
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            DOMAINE
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChange({ domain: d, category: "" })}
                className={`flex flex-col items-center gap-1 p-2 border text-xs transition-colors duration-120 ${
                  data.domain === d
                    ? "border-[#FF7A00] bg-[#FF7A00]/10 text-white"
                    : "border-[#2a2a2a] text-[#555] hover:border-[#FF7A00]/50 hover:text-[#888]"
                }`}
              >
                <span className="text-lg">{DOMAIN_EMOJIS[d]}</span>
                <span className="font-display-md text-[9px]">{DOMAIN_LABELS[d]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            CATÉGORIE / SPORT
          </label>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ category: s })}
                  className={`font-display-md text-xs px-3 py-1.5 border transition-colors duration-120 ${      
                    data.category === s
                      ? "border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]"
                      : "border-[#2a2a2a] text-[#555] hover:border-[#FF7A00]/50 hover:text-[#888]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="ou écris ta catégorie..."
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            maxLength={50}
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white text-sm font-sans px-4 py-3 focus:outline-none focus:border-[#FF7A00] placeholder-[#444] transition-colors"
          />
        </div>

        {/* Titre */}
        <div>
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            TITRE DE LA SESSION
            <span className="text-[#444] ml-2 normal-case font-sans">{data.title.length}/80</span>
          </label>
          <input
            type="text"
            placeholder="ex : Football — Tir & Finition"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={80}
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white text-sm font-sans px-4 py-3 focus:outline-none focus:border-[#FF7A00] placeholder-[#444] transition-colors"
          />
          <p className="text-[#444] text-xs font-sans mt-1.5">
            Format recommandé : Sport — Compétence ciblée
          </p>
        </div>

        {/* Compétence ciblée */}
        <div>
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            COMPÉTENCE CIBLÉE
            <span className="text-[#444] ml-2 normal-case font-sans">{data.skillFocus.length}/100</span>        
          </label>
          <input
            type="text"
            placeholder="ex : Améliorer la précision de tir à 3 points"
            value={data.skillFocus}
            onChange={(e) => onChange({ skillFocus: e.target.value })}
            maxLength={100}
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white text-sm font-sans px-4 py-3 focus:outline-none focus:border-[#FF7A00] placeholder-[#444] transition-colors"
          />
          <p className="text-[#444] text-xs font-sans mt-1.5">
            Ce que le participant repartira avec — sois ultra-précis.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="font-display-md text-xs text-[#888] tracking-widest block mb-3">
            DESCRIPTION
            <span className="text-[#444] ml-2 normal-case font-sans">{data.description.length}/1000</span>      
          </label>
          <textarea
            rows={5}
            placeholder="Décris le déroulé, ce qu'on va travailler, le niveau requis, ce qu'il faut apporter..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            maxLength={1000}
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white text-sm font-sans px-4 py-3 focus:outline-none focus:border-[#FF7A00] placeholder-[#444] transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
