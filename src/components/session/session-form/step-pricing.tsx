import { calculateAmounts } from "@/lib/stripe";
import {
  MIN_PRICE_CENTS,
  MAX_PRICE_CENTS,
  MIN_SPOTS,
  MAX_SPOTS,
  COACH_SHARE_PERCENT,
  PLATFORM_FEE_PERCENT,
  REFERRAL_FEE_PERCENT,
} from "@/constants";
import type { SessionFormData } from "./types";

interface Props {
  data: SessionFormData;
  onChange: (patch: Partial<SessionFormData>) => void;
}

function formatEuros(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

export function StepPricing({ data, onChange }: Props) {
  const amounts        = calculateAmounts(data.priceCents);
  const grossTotal     = data.priceCents * data.maxSpots;
  const coachTotal     = amounts.coachNetCents * data.maxSpots;
  const platformTotal  = amounts.platformFeeCents * data.maxSpots;
  const referralTotal  = amounts.referralFeeCents * data.maxSpots;

  const priceStep = 50; // 0.50€ par cran
  const priceMin  = MIN_PRICE_CENTS; // 1300
  const priceMax  = MAX_PRICE_CENTS; // 2000

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl text-white mb-2">
        TARIF & PLACES
      </h2>
      <p className="text-[#666] text-sm font-sans mb-8">
        Fixe ton prix et le nombre de participants. Tu gardes 70% des revenus.
      </p>

      <div className="space-y-8">

        {/* Prix par personne */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <label className="font-display-md text-xs text-[#888] tracking-widest">
              PRIX PAR PERSONNE
            </label>
            <span className="font-display text-3xl text-[#FF7A00] leading-none">
              {formatEuros(data.priceCents)}
            </span>
          </div>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={priceStep}
            value={data.priceCents}
            onChange={(e) => onChange({ priceCents: Number(e.target.value) })}
            className="w-full accent-[#FF7A00] h-1 cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="font-display-md text-xs text-[#444]">{formatEuros(priceMin)}</span>
            <span className="font-display-md text-xs text-[#444]">{formatEuros(priceMax)}</span>
          </div>

          {/* Aide prix par type */}
          {data.sessionType === "discovery" && data.priceCents > 1600 && (
            <p className="text-[#FF7A00]/70 text-xs font-sans mt-2">
              💡 Pour une session Découverte, 13–16€ est recommandé.
            </p>
          )}
          {data.sessionType === "progression" && data.priceCents < 1600 && (
            <p className="text-[#3b82f6]/70 text-xs font-sans mt-2">
              💡 Pour une session Progression, 16–20€ est recommandé.
            </p>
          )}
        </div>

        {/* Nombre de places */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <label className="font-display-md text-xs text-[#888] tracking-widest">
              PLACES MAX
            </label>
            <span className="font-display text-3xl text-[#FF7A00] leading-none">
              {data.maxSpots}
            </span>
          </div>
          <input
            type="range"
            min={MIN_SPOTS}
            max={MAX_SPOTS}
            step={1}
            value={data.maxSpots}
            onChange={(e) => onChange({ maxSpots: Number(e.target.value) })}
            className="w-full accent-[#FF7A00] h-1 cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="font-display-md text-xs text-[#444]">{MIN_SPOTS} min</span>
            <span className="font-display-md text-xs text-[#444]">{MAX_SPOTS} max</span>
          </div>
        </div>

        {/* Calcul revenus */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
          <p className="font-display-md text-xs text-[#555] tracking-widest mb-4">
            REVENUS ESTIMÉS (SESSION COMPLÈTE)
          </p>

          <div className="flex items-end gap-2 mb-4">
            <span className="font-display text-[3.5rem] text-[#FF7A00] leading-none">
              {formatEuros(coachTotal)}
            </span>
            <span className="font-display-md text-xs text-[#555] mb-2">POUR TOI</span>
          </div>

          {/* Barre de répartition */}
          <div className="w-full h-7 flex overflow-hidden border border-[#2a2a2a] mb-2">
            <div
              className="bg-[#FF7A00] flex items-center justify-center font-display-md text-xs text-white"
              style={{ width: `${COACH_SHARE_PERCENT}%` }}
            >
              {COACH_SHARE_PERCENT}%
            </div>
            <div
              className="bg-[#FF7A00]/25 flex items-center justify-center font-display-md text-[10px] text-white/50"
              style={{ width: `${PLATFORM_FEE_PERCENT}%` }}
            >
              {PLATFORM_FEE_PERCENT}%
            </div>
            <div
              className="bg-[#222] flex items-center justify-center font-display-md text-[10px] text-white/40"
              style={{ width: `${REFERRAL_FEE_PERCENT}%` }}
            >
              {REFERRAL_FEE_PERCENT}%
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#444] font-sans">
            <span>Coach</span>
            <span>Plateforme</span>
            <span>Parrainage</span>
          </div>

          {/* Détail chiffres */}
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-[#555]">{data.maxSpots} × {formatEuros(data.priceCents)}</span>
              <span className="text-[#888]">{formatEuros(grossTotal)} brut</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Commission Passion Spark ({PLATFORM_FEE_PERCENT}%)</span>
              <span className="text-[#555]">−{formatEuros(platformTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Parrainage ({REFERRAL_FEE_PERCENT}%)</span>
              <span className="text-[#555]">−{formatEuros(referralTotal)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-[#252525]">
              <span className="text-white">Tes revenus nets ({COACH_SHARE_PERCENT}%)</span>
              <span className="text-[#FF7A00]">{formatEuros(coachTotal)}</span>
            </div>
            <p className="text-[#444] text-[10px] font-sans pt-1">
              💡 Si tu amènes toi-même tes participants, le {REFERRAL_FEE_PERCENT}% parrainage te revient (soit {COACH_SHARE_PERCENT + REFERRAL_FEE_PERCENT}% au total).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
