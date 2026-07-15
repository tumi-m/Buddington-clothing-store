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
const FLIGHT_VH_TOUCH = 3.5  // shorter journey on phones — thumbs, not wheels
// Exponential seek damping, expressed as a time constant (s⁻¹) so the scrub
// converges at the same wall-clock rate regardless of frame rate — a per-frame
// lerp (the scrub-engine's 0.18) crawls on low-fps mobile GPUs. 12 s⁻¹ matches
// 0.18/frame at 60fps.
const DAMP_K = 12
const SKIP_K = 5             // ≈0.08/frame at 60fps — swifter, still-readable glide
const DONE_EPS = 0.995       // progress beyond this (with target at 1) ends the flight
const KEY_STEP = 0.12        // keyboard advance per press
const TOUCH_GAIN = 1.6       // finger-drag feels ~1 screen per chapter
const FLING_MS = 260         // flick inertia horizon — a swipe coasts this far

export interface ScrollFlight {
  /** Damped flight progress 0→1, mutated per animation frame (no re-renders). */
  progress: MutableRefObject<number>
  /** True once the flight has landed on the resting frame — controls hand off. */
  done: boolean
  /** Current chapter index 0–4 (updates as a state, ≤5 renders per flight). */
  chapter: number
  /** Highest chapter reached — the flight-log stamps collected so far. */
  maxChapter: number
  /** Glide straight to the resting frame. */
  skip: () => void
}

const CHAPTER_COUNT = 5

export function useScrollFlight(active: boolean): ScrollFlight {
  const progress = useRef(0)
  const target = useRef(0)
  const damp = useRef(DAMP_K)
  const [done, setDone] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [maxChapter, setMaxChapter] = useState(0)

  const skip = useCallback(() => {
    target.current = 1
    damp.current = SKIP_K
  }, [])

  useEffect(() => {
    if (!active) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progress.current = 1
      target.current = 1
      setChapter(CHAPTER_COUNT - 1)
      setMaxChapter(CHAPTER_COUNT - 1)
      setDone(true)
      return
    }

    progress.current = 0
    target.current = 0
    damp.current = DAMP_K
    setDone(false)
    setChapter(0)
    setMaxChapter(0)

    let finished = false
    let raf = 0
    const clamp = (v: number) => Math.min(1, Math.max(0, v))
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const length = () => window.innerHeight * (coarse ? FLIGHT_VH_TOUCH : FLIGHT_VH)

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
    let touchX = 0
    let touchT = 0
    let touchV = 0 // finger velocity, px/ms (up = forward)
    let locked: 'flight' | 'ignore' | null = null // direction lock per gesture
    const onTouchStart = (e: TouchEvent) => {
      // Gestures that start on interactive furniture (garment carousel,
      // controls) belong to those elements, not the flight scrub.
      const target0 = e.target as Element | null
      locked = target0?.closest?.('[data-flight-ignore]') ? 'ignore' : null
      touchY = e.touches[0]?.clientY ?? null
      touchX = e.touches[0]?.clientX ?? 0
      touchT = e.timeStamp
      touchV = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (finished || touchY === null || locked === 'ignore') return
      const y = e.touches[0]?.clientY ?? touchY
      const x = e.touches[0]?.clientX ?? touchX
      const dy = touchY - y
      if (locked === null) {
        // Lock direction on first significant movement: horizontal swipes
        // (e.g. browsing the carousel) are left to the page.
        const adx = Math.abs(x - touchX)
        const ady = Math.abs(dy)
        if (adx < 6 && ady < 6) return
        locked = adx > ady ? 'ignore' : 'flight'
        if (locked === 'ignore') return
      }
      e.preventDefault()
      const dt = Math.max(1, e.timeStamp - touchT)
      touchV = touchV * 0.6 + (dy / dt) * 0.4 // smoothed for a stable fling
      target.current = clamp(target.current + (dy * TOUCH_GAIN) / length())
      touchY = y
      touchX = x
      touchT = e.timeStamp
    }
    const onTouchEnd = () => {
      if (touchY !== null && !finished && locked === 'flight') {
        // Flick inertia — coast on in the swipe's direction.
        target.current = clamp(target.current + (touchV * FLING_MS * TOUCH_GAIN) / length())
      }
      touchY = null
      touchV = 0
      locked = null
    }

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

    let lastTick = performance.now()
    let lastChapter = 0
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.1, (now - lastTick) / 1000)
      lastTick = now
      progress.current += (target.current - progress.current) * (1 - Math.exp(-damp.current * dt))
      const c = Math.min(CHAPTER_COUNT - 1, Math.floor(progress.current * CHAPTER_COUNT))
      if (c !== lastChapter) {
        lastChapter = c
        setChapter(c)
        setMaxChapter(m => Math.max(m, c))
      }
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

  return { progress, done, chapter, maxChapter, skip }
}
