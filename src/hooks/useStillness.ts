// FILE: src/hooks/useStillness.ts
// The home page's signature move: the crowd only moves when you do.
//
// Reads the visitor's scroll velocity on the shell's scroll container and
// publishes it on the page root as two custom properties:
//   --sv  0..1  how hard they are scrolling right now (eased, decays to 0)
//   --sd  -1|1  which way
// CSS fades the motion-streaked crowd plate in on --sv and drifts it against
// the direction of travel, while the subject plane never moves.
//
// It also watches one "peak" element. Once the peak is on screen and the
// visitor has held still for STILL_MS, the peak gets data-still="1", which is
// what reveals its final line. That flag is set once and never cleared:
// content that re-hides on the way back is a defect, not an effect.
//
// A `film:rush` event on the root (sent by the page once its hero layers are
// on screen) starts an opening rush that settles, so the mechanic teaches
// itself without a "scroll" cue. Under reduced motion there is no
// rush, no streak, and the peak is resolved from the start.

import { useEffect } from 'react'
import type { RefObject } from 'react'

const STILL_MS = 1100        // how long "not scrolling" must last to count
const FULL_SPEED = 2.4       // px per ms of scroll that reads as a full rush
const DECAY_S = 0.32         // time constant for the rush to settle
const OPENING_RUSH = 0.85    // where --sv starts on arrival
// The arrival holds its rush before settling. Settling at once made the hero
// read as stillness, which stole the peak's feeling (found in the feel check).
const OPENING_HOLD_MS = 1600

export function useStillness(
  rootRef: RefObject<HTMLElement>,
  peakRef: RefObject<HTMLElement>,
): void {
  useEffect(() => {
    const root = rootRef.current
    const peak = peakRef.current
    if (!root || !peak) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      root.style.setProperty('--sv', '0')
      peak.dataset.still = '1'
      return
    }

    // The editorial shell scrolls inside its own element, not the document.
    const scroller: HTMLElement | Window =
      (root.closest('[data-scroller]') as HTMLElement | null) ?? window
    const readY = () =>
      scroller instanceof Window ? scroller.scrollY : scroller.scrollTop

    let v = 0
    let holdUntil = 0
    let dir = 1
    let lastY = readY()
    let lastT = performance.now()
    let lastMove = lastT
    let peakVisible = false
    let raf = 0
    let prevWritten = -1

    const write = () => {
      const rounded = Math.round(v * 1000) / 1000
      if (rounded === prevWritten) return
      prevWritten = rounded
      root.style.setProperty('--sv', rounded.toFixed(3))
      root.style.setProperty('--sd', String(dir))
    }

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastT) / 1000)
      lastT = now
      if (now >= holdUntil) v *= Math.exp(-dt / DECAY_S)
      if (v < 0.002) v = 0
      write()

      if (
        peakVisible &&
        peak.dataset.still !== '1' &&
        v === 0 &&
        now - lastMove > STILL_MS
      ) {
        peak.dataset.still = '1'
      }

      // Stop the loop once everything has settled and there is nothing left
      // to wait for. A scroll event or the peak arriving restarts it.
      const waitingOnPeak = peakVisible && peak.dataset.still !== '1'
      if (v > 0 || waitingOnPeak) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const wake = () => {
      if (!raf) {
        lastT = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }

    const onScroll = () => {
      const now = performance.now()
      const y = readY()
      const dy = y - lastY
      const dtMs = Math.max(1, now - lastMove)
      lastY = y
      lastMove = now
      if (dy !== 0) dir = dy > 0 ? 1 : -1
      const target = Math.min(1, Math.abs(dy) / dtMs / FULL_SPEED)
      // Rise quickly toward a harder scroll, never snap down: the decay in
      // tick() is what settles it.
      v = Math.max(v, v * 0.5 + target * 0.5)
      wake()
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) peakVisible = e.isIntersecting
        if (peakVisible) {
          lastMove = Math.max(lastMove, performance.now() - STILL_MS / 2)
          wake()
        }
      },
      { threshold: 0.55 },
    )
    io.observe(peak)

    // Pause while the tab is hidden; nobody is watching the crowd.
    const onVisibility = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!document.hidden) {
        wake()
      }
    }

    const onRush = () => {
      v = Math.max(v, OPENING_RUSH)
      holdUntil = performance.now() + OPENING_HOLD_MS
      wake()
    }
    root.addEventListener('film:rush', onRush)
    scroller.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    write()
    wake()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      scroller.removeEventListener('scroll', onScroll)
      root.removeEventListener('film:rush', onRush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [rootRef, peakRef])
}
