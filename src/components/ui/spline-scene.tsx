'use client'

import { Suspense, lazy, Component } from 'react'
import type { ComponentType, ReactNode, ErrorInfo } from 'react'

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

// Error boundary to catch runtime errors thrown by Spline during render
// (e.g. "Failed to fetch" when the .splinecode scene file can't be loaded).
// React error boundaries only work as class components.
class SplineErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(error: Error, _info: ErrorInfo) {
    // Suppress Spline CDN / scene-fetch errors silently
    console.warn('[SplineScene] Spline failed to load:', error.message)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineErrorBoundary fallback={null}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin" />
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineErrorBoundary>
  )
}
