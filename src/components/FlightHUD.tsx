// FILE: src/components/FlightHUD.tsx
// House-grammar HUD for the scroll flight in the EXPERIENCE view: chapter
// label + FLIGHT LOG stamps (roman numerals, collected as you fly), a 1px
// accent progress hairline on the right edge, a pulsing SCROLL/SWIPE cue, and a
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
  'The sky',
  'The descent',
  'The ground',
  'The current',
  'The garment',
]

export function FlightHUD({ progress, done, chapter, maxChapter, onSkip }: FlightHUDProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  // Touch devices swipe; pointers scroll. Decided once — it doesn't change mid-flight.
  const [cueLabel] = useState(() =>
    window.matchMedia('(pointer: coarse)').matches ? 'Swipe up' : 'Scroll',
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
        className="glass absolute left-4 select-none px-4 py-3 sm:left-6"
        style={{ bottom: 'calc(13rem + env(safe-area-inset-bottom))' }}
      >
        <p className="mb-1 text-[0.68rem] text-white/40">Flight log · A41</p>
        <p className="mb-2.5 text-[0.9rem] font-medium text-white">
          {NUMERALS[chapter]} · {CHAPTERS[chapter]}
        </p>
        <div className="flex gap-1.5">
          {NUMERALS.map((n, i) => (
            <span
              key={n}
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[0.6rem] transition-colors duration-500 ${
                i <= maxChapter
                  ? 'bg-accent text-white'
                  : 'border border-white/15 text-white/30'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Progress hairline — right edge, accent fill over a faint track */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-28 sm:h-40 w-[3px] rounded-full bg-white/15 overflow-hidden">
        <div
          ref={fillRef}
          className="absolute inset-0 rounded-full bg-accent origin-top"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>

      {/* Scroll / swipe cue — floats mid-sky, fades once the descent begins */}
      <div
        ref={cueRef}
        className="absolute inset-x-0 top-[38%] flex flex-col items-center gap-2.5 transition-opacity duration-500 select-none"
      >
        <p className="flight-cue text-[0.85rem] font-medium text-white/85">
          {cueLabel}
        </p>
        <span className="block h-8 w-px bg-gradient-to-b from-accent to-transparent" />
      </div>

      {/* Skip — right edge above the carousel, the one interactive HUD element */}
      <button
        type="button"
        onClick={onSkip}
        tabIndex={done ? -1 : 0}
        className="pointer-events-auto glass absolute right-4 px-4 py-2 text-[0.8rem] text-white/70 transition-colors hover:text-white sm:right-12"
        style={{ bottom: 'calc(13rem + env(safe-area-inset-bottom))' }}
      >
        Skip →
      </button>
    </div>
  )
}
