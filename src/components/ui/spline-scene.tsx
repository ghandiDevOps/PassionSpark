'use client'

import { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'

interface SplineSceneProps {
  scene: string
  className?: string
}

// Graceful fallback — if the Spline CDN fails to load, render nothing instead of crashing.
// We cast the Promise to the correct ComponentType shape so TypeScript accepts the JSX props.
const Spline = lazy(
  () =>
    (import('@splinetool/react-spline').catch(() => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      default: function SplineFallback(_props: SplineSceneProps) { return null },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any) as Promise<{ default: ComponentType<SplineSceneProps> }>
)

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
