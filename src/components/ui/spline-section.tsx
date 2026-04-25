'use client'

import { SplineScene } from '@/components/ui/spline-scene'
import { Spotlight } from '@/components/ui/spotlight'

export function SplineSection() {
  return (
    <div className="w-full h-[480px] sm:h-[560px] bg-[#0a0a0a] border-y border-white/[0.06] relative overflow-hidden">
      <Spotlight size={400} />

      <div className="flex h-full">
        {/* Left — pitch */}
        <div className="flex-1 p-8 sm:p-12 relative z-10 flex flex-col justify-center">
          <p className="font-display-md text-[10px] tracking-[0.3em] text-[#FF7A00] mb-4">
            SPARK YOUR PASSION
          </p>
          <h2
            className="text-white leading-[0.88] mb-6"
            style={{
              fontFamily: "'Arial Black', Impact, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              textTransform: "uppercase",
            }}
          >
            UNE COMPÉTENCE.<br />
            <span
              style={{
                background: "linear-gradient(135deg, #FFB700, #FF7A00, #FF3D00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DÉBLOQUÉE.
            </span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base font-sans leading-relaxed max-w-xs">
            Un coach. Un groupe. Une heure.
            La technique que tu cherchais, enfin accessible.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px w-8 bg-[#FF7A00]" />
            <span className="font-display-md text-[10px] tracking-[0.25em] text-[#FF7A00]">
              DÈS 13€ LA SESSION
            </span>
          </div>
        </div>

        {/* Right — 3D */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
