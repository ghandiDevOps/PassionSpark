'use client'

import { Suspense, lazy } from 'react'

// Graceful fallback — if the Spline CDN fails to load, render nothing instead of crashing
const Spline = lazy(() =>
  import('@splinetool/react-spline').catch(() => ({
    default: () => null as unknown as React.ReactElement,
  }))
)

interface SplineSceneProps {
  scene: string
  className?: string
}

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
