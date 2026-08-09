'use client';

import { useSessionForm } from '@/hooks/use-session-form';
import { StepType }     from './step-type';
import { StepInfo }     from './step-info';
import { StepDatetime } from './step-datetime';
import { StepLocation } from './step-location';
import { StepPricing }  from './step-pricing';
import { StepPreview }  from './step-preview';

const STEPS = [
  { label: 'TYPE',    title: 'Type'   },
  { label: 'INFOS',   title: 'Infos'  },
  { label: 'DATE',    title: 'Date'   },
  { label: 'LIEU',    title: 'Lieu'   },
  { label: 'TARIF',   title: 'Tarif'  },
  { label: 'APERÇU', title: 'Aperçu' },
] as const;

export function SessionForm() {
  const { step, goNext, goPrev, goToStep, data, patch, error, loading, submit, progress, isLastStep } = useSessionForm();

  return (
    <div className="min-h-screen bg-[#1a1a1a]">

      {/* ── Progress header ── */}
      <div className="sticky top-0 z-30 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => { if (i < step) goToStep(i); }}
                disabled={i > step}
                className={`shrink-0 font-display-md text-[10px] px-3 py-1.5 border transition-colors duration-120 ${
                  i === step
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]'
                    : i < step
                    ? 'border-[#2a2a2a] text-[#555] hover:text-[#888] cursor-pointer'
                    : 'border-[#1e1e1e] text-[#333] cursor-not-allowed'
                }`}
              >
                {i < step ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
          <div className="h-px bg-[#1e1e1e] relative">
            <div
              className="absolute inset-y-0 left-0 bg-[#FF7A00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {step === 0 && <StepType     data={data} onChange={patch} />}
        {step === 1 && <StepInfo     data={data} onChange={patch} />}
        {step === 2 && <StepDatetime data={data} onChange={patch} />}
        {step === 3 && <StepLocation data={data} onChange={patch} />}
        {step === 4 && <StepPricing  data={data} onChange={patch} />}
        {step === 5 && <StepPreview  data={data} />}

        {error && (
          <div className="mt-6 bg-[#FF3D00]/10 border border-[#FF3D00]/30 px-4 py-3">
            <p className="text-[#FF3D00] text-sm font-sans">{error}</p>
          </div>
        )}
      </div>

      {/* ── Sticky navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-[#2a2a2a]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={goPrev} className="btn-passion-outline px-6 py-3 text-sm">
              ← RETOUR
            </button>
          )}
          <div className="flex-1" />
          {!isLastStep ? (
            <button type="button" onClick={goNext} className="btn-passion px-8 py-3 text-sm">
              SUIVANT →
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={loading} className="btn-passion px-8 py-3 text-sm pulse-orange">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  PUBLICATION...
                </span>
              ) : 'PUBLIER LA SESSION 🔥'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
