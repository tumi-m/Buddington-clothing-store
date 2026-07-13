// FILE: src/hooks/useScrollFlight.ts
// Scroll-scrubbed flight engine for the EXPERIENCE view.
// Adapted from the scroll-world scrub engine: user input moves a virtual scroll
// target and the rendered progress eases toward it with exponential damping
// (factor 0.18). The page itself never scrolls (html/body are overflow:hidden),
// so wheel / touch / keys drive a virtual [0,1] progress instead. Progress is
// exposed through a mutable ref and read inside useFrame — React never
// re-renders during the scrub. prefers-reduced-motion skips the flight
// entirely and lands on the resting frame.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

const FLIGHT_VH = 5          // virtual scroll length ≈ 5 viewport-heights (one per chapter)
const DAMP = 0.18            // scrub-engine exponential seek damping
const SKIP_DAMP = 0.08       // swifter, still-readable glide when skipping
const DONE_EPS = 0.995       // progress beyond this (with target at 1) ends the flight
const KEY_STEP = 0.12        // keyboard advance per press
const TOUCH_GAIN = 1.6       // finger-drag feels ~1 screen per chapter

export interface ScrollFlight {
  /** Damped flight progress 0→1, mutated per animation frame (no re-renders). */
  progress: MutableRefObject<number>
  /** True once the flight has landed on the resting frame — controls hand off. */
  done: boolean
  /** Glide straight to the resting frame. */
  skip: () => void
}

export function useScrollFlight(active: boolean): ScrollFlight {
  const progress = useRef(0)
  const target = useRef(0)
  const damp = useRef(DAMP)
  const [done, setDone] = useState(false)

  const skip = useCallback(() => {
    target.current = 1
    damp.current = SKIP_DAMP
  }, [])

  useEffect(() => {
    if (!active) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progress.current = 1
      target.current = 1
      setDone(true)
      return
    }

    progress.current = 0
    target.current = 0
    damp.current = DAMP
    setDone(false)

    let finished = false
    let raf = 0
    const clamp = (v: number) => Math.min(1, Math.max(0, v))
    const length = () => window.innerHeight * FLIGHT_VH

    const onWheel = (e: WheelEvent) => {
      if (finished) return
      e.preventDefault()
      const px =
        e.deltaMode === 1 ? e.deltaY * 16
        : e.deltaMode === 2 ? e.deltaY * window.innerHeight
        : e.deltaY
      target.current = clamp(target.current + px / length())
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (finished || touchY === null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY ?? touchY
      target.current = clamp(target.current + ((touchY - y) * TOUCH_GAIN) / length())
      touchY = y
    }
    const onTouchEnd = () => { touchY = null }

    const onKey = (e: KeyboardEvent) => {
      if (finished) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        target.current = clamp(target.current + KEY_STEP)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        target.current = clamp(target.current - KEY_STEP)
      } else if (e.key === 'End') {
        e.preventDefault()
        target.current = 1
      } else if (e.key === 'Home') {
        e.preventDefault()
        target.current = 0
      }
    }

    const remove = () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }

    const tick = () => {
      progress.current += (target.current - progress.current) * damp.current
      if (target.current >= 1 && progress.current > DONE_EPS) {
        // Land exactly on the resting frame, release input to OrbitControls.
        progress.current = 1
        finished = true
        remove()
        setDone(true)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    raf = requestAnimationFrame(tick)

    return () => {
      remove()
      cancelAnimationFrame(raf)
    }
  }, [active])

  return { progress, done, skip }
}
