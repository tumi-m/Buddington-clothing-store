// FILE: src/components/FlightHUD.tsx
// House-grammar HUD for the scroll flight in the EXPERIENCE view: chapter
// label (roman numerals, mono uppercase), a 1px gold progress hairline on the
// right edge, a pulsing SCROLL cue, and a SKIP control. All per-frame updates
// mutate the DOM directly from a rAF loop reading the progress ref — no React
// re-renders during the scrub. Fades away once the flight lands.

import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { FLIGHT_CHAPTERS } from './FlightRig'

interface FlightHUDProps {
  progress: MutableRefObject<number>
  done: boolean
  onSkip: () => void
}

const CHAPTERS: readonly string[] = [
  'I — THE SKY',
  'II — THE DESCENT',
  'III — THE GROUND',
  'IV — THE CURRENT',
  'V — THE GARMENT',
]

export function FlightHUD({ progress, done, onSkip }: FlightHUDProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const chapterRef = useRef<HTMLParagraphElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const lastChapter = useRef(-1)

  useEffect(() => {
    if (done) return
    let raf = 0
    const tick = () => {
      const p = progress.current
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`
      const chapter = Math.min(FLIGHT_CHAPTERS - 1, Math.floor(p * FLIGHT_CHAPTERS))
      if (chapter !== lastChapter.current && chapterRef.current) {
        lastChapter.current = chapter
        chapterRef.current.textContent = CHAPTERS[chapter]
      }
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
      {/* Chapter label — bottom-left, folio grammar */}
      <p
        ref={chapterRef}
        className="absolute bottom-14 sm:bottom-6 left-4 sm:left-6 font-mono uppercase text-[0.65rem] tracking-[0.14em] text-paper/70 select-none"
      >
        {CHAPTERS[0]}
      </p>

      {/* Progress hairline — right edge, gold fill over a faint track */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-40 w-px bg-paper/15">
        <div
          ref={fillRef}
          className="absolute inset-0 bg-gold origin-top"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>

      {/* Scroll cue — centre, fades once the descent begins */}
      <div
        ref={cueRef}
        className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 transition-opacity duration-500 select-none"
      >
        <p className="font-mono uppercase text-[0.65rem] tracking-[0.3em] text-paper/80 flight-cue">
          SCROLL
        </p>
        <span className="block h-8 w-px bg-gold/70" />
      </div>

      {/* Skip — bottom-right, the one interactive element of the HUD */}
      <button
        type="button"
        onClick={onSkip}
        tabIndex={done ? -1 : 0}
        className="pointer-events-auto absolute bottom-6 right-4 sm:right-12 font-mono uppercase text-[0.6rem] tracking-[0.14em] text-gray-400 hover:text-gold border border-white/10 hover:border-gold px-3 py-1.5 rounded bg-black/40 backdrop-blur-md transition-colors focus-visible:outline-gold"
      >
        SKIP →
      </button>
    </div>
  )
}
