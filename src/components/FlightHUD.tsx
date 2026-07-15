// FILE: src/components/FlightHUD.tsx
// House-grammar HUD for the scroll flight in the EXPERIENCE view: chapter
// label + FLIGHT LOG stamps (roman numerals, collected as you fly), a 1px
// gold progress hairline on the right edge, a pulsing SCROLL/SWIPE cue, and a
// SKIP control. Positioned clear of the garment carousel, which stays live
// during the flight. Per-frame updates (hairline fill, cue fade) mutate the
// DOM directly from a rAF loop reading the progress ref — chapter/stamp
// changes are ordinary React state (≤5 renders per flight). Fades away once
// the flight lands.

import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

interface FlightHUDProps {
  progress: MutableRefObject<number>
  done: boolean
  /** Current chapter index 0–4. */
  chapter: number
  /** Highest chapter reached — stamps collected in the flight log. */
  maxChapter: number
  onSkip: () => void
}

const NUMERALS: readonly string[] = ['I', 'II', 'III', 'IV', 'V']
const CHAPTERS: readonly string[] = [
  'THE SKY',
  'THE DESCENT',
  'THE GROUND',
  'THE CURRENT',
  'THE GARMENT',
]

export function FlightHUD({ progress, done, chapter, maxChapter, onSkip }: FlightHUDProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  // Touch devices swipe; pointers scroll. Decided once — it doesn't change mid-flight.
  const [cueLabel] = useState(() =>
    window.matchMedia('(pointer: coarse)').matches ? 'SWIPE UP' : 'SCROLL',
  )

  useEffect(() => {
    if (done) return
    let raf = 0
    const tick = () => {
      const p = progress.current
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`
      if (cueRef.current) cueRef.current.style.opacity = p < 0.02 ? '1' : '0'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, done])

  return (
    <div
      aria-hidden={done}
      className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-700 ${
        done ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Flight log — chapter label + collected stamps, left edge above the carousel */}
      <div
        className="absolute left-4 sm:left-6 select-none"
        style={{ bottom: 'calc(13rem + env(safe-area-inset-bottom))' }}
      >
        <p className="font-mono uppercase text-[0.55rem] tracking-[0.14em] text-paper/40 mb-1">
          FLIGHT LOG A41
        </p>
        <p className="font-mono uppercase text-[0.65rem] tracking-[0.14em] text-paper/80 mb-2">
          {NUMERALS[chapter]} — {CHAPTERS[chapter]}
        </p>
        <div className="flex gap-2">
          {NUMERALS.map((n, i) => (
            <span
              key={n}
              className={`font-mono text-[0.6rem] tracking-[0.14em] transition-colors duration-500 ${
                i <= maxChapter ? 'text-gold' : 'text-paper/25'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Progress hairline — right edge, gold fill over a faint track */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-28 sm:h-40 w-px bg-paper/15">
        <div
          ref={fillRef}
          className="absolute inset-0 bg-gold origin-top"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>

      {/* Scroll / swipe cue — floats mid-sky, fades once the descent begins */}
      <div
        ref={cueRef}
        className="absolute inset-x-0 top-[38%] flex flex-col items-center gap-2 transition-opacity duration-500 select-none"
      >
        <p className="font-mono uppercase text-[0.65rem] tracking-[0.3em] text-paper/80 flight-cue">
          {cueLabel}
        </p>
        <span className="block h-8 w-px bg-gold/70" />
      </div>

      {/* Skip — right edge above the carousel, the one interactive HUD element */}
      <button
        type="button"
        onClick={onSkip}
        tabIndex={done ? -1 : 0}
        className="pointer-events-auto absolute right-4 sm:right-12 font-mono uppercase text-[0.6rem] tracking-[0.14em] text-gray-400 hover:text-gold border border-white/10 hover:border-gold px-3 py-2 sm:py-1.5 rounded bg-black/40 backdrop-blur-md transition-colors focus-visible:outline-gold"
        style={{ bottom: 'calc(13rem + env(safe-area-inset-bottom))' }}
      >
        SKIP →
      </button>
    </div>
  )
}
