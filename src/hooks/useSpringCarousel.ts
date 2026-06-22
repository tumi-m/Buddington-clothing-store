// FILE: src/hooks/useSpringCarousel.ts
// Lightweight spring-physics carousel controller. Zero dependencies.
// Handles drag, momentum, snap-to-item, and keyboard navigation.
// Respects prefers-reduced-motion by snapping instantly.

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'

export interface SpringCarouselOptions {
  /** Total number of items. */
  count: number
  /** Minimum item width in pixels; used to compute how many items fit. */
  minItemWidth: number
  /** Called when the active index changes. */
  onChange?: (index: number) => void
  /** Initial active index. */
  initialIndex?: number
}

export interface SpringCarouselState {
  /** Currently focused / active item index. */
  index: number
  /** Programmatically set the active index (animated unless reduced motion). */
  setIndex: (i: number) => void
  /** Ref to attach to the scroll/track container. */
  trackRef: React.RefObject<HTMLDivElement>
  /** Pointer event binders for drag. */
  bindDrag: () => {
    onPointerDown: (e: React.PointerEvent) => void
  }
  /** Keyboard event binder. */
  bindKeyboard: () => {
    onKeyDown: (e: React.KeyboardEvent) => void
    tabIndex: number
    role: string
    'aria-label': string
  }
  /** Whether a drag animation is currently in progress. */
  dragging: boolean
}

const SPRING_STIFFNESS = 0.14
const SPRING_DAMPING   = 0.78
const DRAG_THRESHOLD   = 40   // px to count as a swipe
const VELOCITY_THRESHOLD = 0.3 // px/ms to count as a fling

export function useSpringCarousel({
  count,
  minItemWidth,
  onChange,
  initialIndex = 0,
}: SpringCarouselOptions): SpringCarouselState {
  const [index, setIndexState] = useState(() => Math.max(0, Math.min(initialIndex, count - 1)))
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Current visual transform and velocity for the spring loop.
  const posRef = useRef(0)
  const velRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const reducedMotionRef = useRef(false)

  const itemWidthRef = useRef(minItemWidth)
  const visibleCountRef = useRef(1)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Compute item width from container width.
  const updateMetrics = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const visible = Math.max(1, Math.floor(rect.width / minItemWidth))
    visibleCountRef.current = visible
    itemWidthRef.current = rect.width / visible
  }, [minItemWidth])

  // Snap target transform to the active index.
  const setTargetForIndex = useCallback((i: number) => {
    updateMetrics()
    const visible = visibleCountRef.current
    const itemWidth = itemWidthRef.current
    // Center-ish the active item: don't scroll past the end.
    const maxIndex = Math.max(0, count - visible)
    const clamped = Math.max(0, Math.min(i, maxIndex))
    targetRef.current = -(clamped * itemWidth)
    return clamped
  }, [count, updateMetrics])

  const setIndex = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(i, count - 1))
    const final = setTargetForIndex(clamped)
    if (final !== index) {
      setIndexState(final)
      onChange?.(final)
    }
    if (reducedMotionRef.current) {
      posRef.current = targetRef.current
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
      return
    }
    animate()
  }, [count, index, onChange, setTargetForIndex])

  // Spring animation loop.
  const animate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const step = () => {
      const force = (targetRef.current - posRef.current) * SPRING_STIFFNESS
      velRef.current = (velRef.current + force) * SPRING_DAMPING
      posRef.current += velRef.current

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
      }

      const still = Math.abs(targetRef.current - posRef.current) < 0.5 && Math.abs(velRef.current) < 0.1
      if (still) {
        posRef.current = targetRef.current
        if (trackRef.current) trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
        rafRef.current = null
        setDragging(false)
      } else {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  // Keep target/position in sync when index changes externally.
  useEffect(() => {
    updateMetrics()
    targetRef.current = setTargetForIndex(index)
    posRef.current = targetRef.current
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
  }, [index, setTargetForIndex, updateMetrics])

  // Update metrics on resize.
  useEffect(() => {
    const onResize = () => {
      updateMetrics()
      targetRef.current = setTargetForIndex(index)
      posRef.current = targetRef.current
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [index, setTargetForIndex, updateMetrics])

  // Drag interaction.
  const dragStart = useRef<{ x: number; time: number } | null>(null)
  const lastMove = useRef<{ x: number; time: number } | null>(null)
  const startPos = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    updateMetrics()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    dragStart.current = { x: e.clientX, time: performance.now() }
    lastMove.current = { x: e.clientX, time: performance.now() }
    startPos.current = posRef.current
    setDragging(true)

    const target = e.currentTarget as HTMLDivElement
    target.setPointerCapture(e.pointerId)

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.x
      posRef.current = startPos.current + dx
      lastMove.current = { x: ev.clientX, time: performance.now() }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
      }
    }

    const onPointerUp = (ev: PointerEvent) => {
      if (!dragStart.current || !lastMove.current) return
      target.releasePointerCapture(ev.pointerId)
      const dx = ev.clientX - dragStart.current.x
      const dt = performance.now() - lastMove.current.time
      const velocity = dt > 0 ? (ev.clientX - lastMove.current.x) / dt : 0
      dragStart.current = null
      lastMove.current = null

      const itemWidth = itemWidthRef.current
      let next = index
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(velocity) > VELOCITY_THRESHOLD) {
        next = dx < 0 || velocity < 0 ? Math.min(count - 1, index + 1) : Math.max(0, index - 1)
      }
      setIndex(next)
    }

    target.addEventListener('pointermove', onPointerMove)
    target.addEventListener('pointerup', onPointerUp, { once: true })
    target.addEventListener('pointercancel', onPointerUp, { once: true })
  }, [count, index, setIndex, updateMetrics])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setIndex(Math.max(0, index - 1))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setIndex(Math.min(count - 1, index + 1))
    }
  }, [count, index, setIndex])

  const bindDrag = useCallback(() => ({ onPointerDown }), [onPointerDown])
  const bindKeyboard = useMemo(() => () => ({
    onKeyDown,
    tabIndex: 0,
    role: 'region',
    'aria-label': 'Garment carousel',
  }), [onKeyDown])

  return {
    index,
    setIndex,
    trackRef,
    bindDrag,
    bindKeyboard,
    dragging,
  }
}
