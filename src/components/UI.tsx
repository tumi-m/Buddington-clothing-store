import { useEffect, useState } from 'react'
import type { View, Weather, DayNight } from '../types'
import type { Garment } from '../data/garments'
import { useCart } from '../cart/CartContext'
import { GarmentStrip } from './GarmentStrip'

interface UIProps {
  windStrength: number
  onWindChange: (v: number) => void
  onInfoToggle: () => void
  showInfo: boolean
  /** Optional view-state switcher. When provided, the overlay nav becomes live. */
  onNavigate?: (v: View) => void
  /** Optional weather + day/night controls for the experience view. */
  weather?: Weather
  onWeatherChange?: (w: Weather) => void
  dayNight?: DayNight
  onDayNightToggle?: () => void
  /** Optional quality toggle for adaptive performance scaling. */
  quality?: 'high' | 'low'
  onQualityChange?: (q: 'high' | 'low') => void
  /** Optional garment selector — which piece of clothing is suspended. */
  garments?: Garment[]
  selectedGarment?: string
  onGarmentChange?: (id: string) => void
  /** True while the entry scroll-flight owns the camera — the settings stack
   *  stays out of the frame until landing; carousel and bag remain live. */
  flightActive?: boolean
}

// ── GALE TRIAL — hold the fan at gale to earn the STORMPROOF stamp ─────────
const GALE_THRESHOLD = 0.9
const GALE_HOLD_S = 6
const STORMPROOF_KEY = 'buddington-stormproof'

function useGaleTrial(windStrength: number) {
  const [earned, setEarned] = useState(() => {
    try { return localStorage.getItem(STORMPROOF_KEY) === '1' } catch { return false }
  })
  const [held, setHeld] = useState(0)
  const atGale = windStrength >= GALE_THRESHOLD

  useEffect(() => {
    if (earned || !atGale) {
      setHeld(0)
      return
    }
    const started = performance.now()
    const id = window.setInterval(() => {
      const s = (performance.now() - started) / 1000
      if (s >= GALE_HOLD_S) {
        window.clearInterval(id)
        setHeld(GALE_HOLD_S)
        setEarned(true)
        try { localStorage.setItem(STORMPROOF_KEY, '1') } catch { /* private mode */ }
      } else {
        setHeld(s)
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [earned, atGale])

  return { earned, held, atGale }
}

export function UI({
  windStrength, onWindChange, onInfoToggle, showInfo,
  onNavigate, weather, onWeatherChange, dayNight, onDayNightToggle,
  quality, onQualityChange,
  garments, selectedGarment, onGarmentChange,
  flightActive = false,
}: UIProps) {
  const [fanOn, setFanOn] = useState(true)
  const [controlsOpen, setControlsOpen] = useState(false)   // mobile: collapse the control stack
  const { count, open, addItem } = useCart()
  const trial = useGaleTrial(windStrength)

  const toggleFan = () => {
    const next = !fanOn
    setFanOn(next)
    onWindChange(next ? 0.5 : 0)
  }

  // ── Garment navigation (GTA weapon-wheel style: step left / right) ──────────
  const index = garments?.findIndex(g => g.id === selectedGarment) ?? -1
  const current = index >= 0 ? garments![index] : undefined
  const step = (dir: -1 | 1) => {
    if (!garments || !onGarmentChange || garments.length === 0) return
    const base = index < 0 ? 0 : index
    const next = (base + dir + garments.length) % garments.length
    onGarmentChange(garments[next].id)
  }
  const addCurrent = () => {
    if (!current) return
    addItem({
      id: current.id, code: current.code, name: current.name,
      price: current.priceValue, currency: current.currency, image: current.image,
    })
  }

  return (
    <>
      {/* ── Brand wordmark (top-left) ─────────────────────────────────────── */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none select-none">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[0.8rem] font-semibold text-white"
            aria-hidden="true"
          >
            B
          </span>
          <span className="text-[1.05rem] font-semibold tracking-tight text-white">
            Buddington
          </span>
        </div>
        <div className="hidden sm:block text-[0.78rem] text-white/45 mt-1.5">
          A/W 41 · In the elements
        </div>
        {trial.earned && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[0.7rem] font-medium text-accent ring-1 ring-inset ring-accent/30">
            ✦ Stormproof
          </div>
        )}
      </div>

      {/* ── GTA-style garment toggles (one on each side) ──────────────────── */}
      {garments && garments.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous garment"
            onClick={() => step(-1)}
            className="group absolute left-1 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-16 flex items-center justify-center text-paper/45 hover:text-accent transition-colors focus-visible:outline-accent"
          >
            <span className="text-3xl sm:text-4xl font-thin leading-none group-active:-translate-x-1 transition-transform">❮</span>
          </button>
          <button
            type="button"
            aria-label="Next garment"
            onClick={() => step(1)}
            className="group absolute right-1 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-16 flex items-center justify-center text-paper/45 hover:text-accent transition-colors focus-visible:outline-accent"
          >
            <span className="text-3xl sm:text-4xl font-thin leading-none group-active:translate-x-1 transition-transform">❯</span>
          </button>
        </>
      )}

      {/* ── Active piece — code / price / add (above the carousel) ─────────── */}
      {current && (
        <div data-flight-ignore className="absolute left-1/2 -translate-x-1/2 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:bottom-[7.5rem] z-30 flex flex-col items-center gap-1.5 select-none pointer-events-none">
          <p className="font-mono text-[0.7rem] text-white/70">{current.code}</p>
          <p className="text-[0.95rem] font-medium text-white">{current.price}</p>
          <button
            type="button"
            onClick={addCurrent}
            aria-label={`Add ${current.code} to bag`}
            className="pointer-events-auto mt-1 w-9 h-9 flex items-center justify-center text-2xl font-thin leading-none text-white border border-white/25 rounded-full hover:bg-accent hover:border-accent hover:text-white transition-colors focus-visible:outline-accent"
          >
            +
          </button>
        </div>
      )}

      {/* ── Carousel of 3D-rendered garments (bottom, swipeable) ──────────── */}
      {garments && onGarmentChange && garments.length > 1 && (
        <div data-flight-ignore className="absolute inset-x-0 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] sm:bottom-3 z-20 pointer-events-none">
          <div className="mx-auto w-full sm:max-w-2xl pointer-events-auto">
            <GarmentStrip
              garments={garments}
              selectedId={selectedGarment ?? garments[0]?.id ?? ''}
              onSelect={onGarmentChange}
            />
          </div>
        </div>
      )}

      {/* ── Controls (bottom-right on desktop · collapsible top-right on mobile).
             During the entry flight the stack stays out of frame — the journey
             drives the elements until the camera lands. ── */}
      <div
        data-flight-ignore
        aria-hidden={flightActive}
        className={`absolute right-3 md:right-6 top-16 md:top-auto md:bottom-6 z-40 flex flex-col gap-2 md:gap-3 items-end transition-opacity duration-700 ${
          flightActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setControlsOpen(o => !o)}
          aria-expanded={controlsOpen}
          className="md:hidden glass px-3.5 py-2 text-[0.78rem] font-medium text-white"
        >
          {controlsOpen ? '✕ Close' : '⚙ Controls'}
        </button>

        <div className={`${controlsOpen ? 'flex' : 'hidden'} md:flex flex-col gap-2 md:gap-3 items-end`}>
          {/* Quality toggle */}
          {onQualityChange && quality && (
            <div className="glass px-4 py-3 w-[210px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.78rem] text-white/55">Quality</span>
                <button
                  onClick={() => onQualityChange(quality === 'high' ? 'low' : 'high')}
                  className="chip chip-on"
                >
                  {quality === 'high' ? 'High' : 'Low'}
                </button>
              </div>
            </div>
          )}

          {/* Weather selector + day/night */}
          {onWeatherChange && weather && (
            <div className="glass px-4 py-3 w-[210px]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[0.78rem] text-white/55">Weather</span>
                {onDayNightToggle && dayNight && (
                  <button onClick={onDayNightToggle} className="chip chip-on">
                    {dayNight === 'day' ? '☀ Day' : '☾ Night'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['sunny', 'windy', 'rain', 'snow', 'hail'] as Weather[]).map(w => (
                  <button
                    key={w}
                    onClick={() => onWeatherChange(w)}
                    className={`chip ${weather === w ? 'chip-on' : ''}`}
                  >
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wind / fan control */}
          <div className="glass px-4 py-3 w-[210px]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[0.78rem] text-white/55">Fan</span>
              <button onClick={toggleFan} className={`chip ${fanOn ? 'chip-on' : ''}`}>
                {fanOn ? 'On' : 'Off'}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={windStrength}
              onChange={e => {
                const v = parseFloat(e.target.value)
                onWindChange(v)
                setFanOn(v > 0)
              }}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[0.7rem] text-white/30">calm</span>
              <span className="text-[0.7rem] text-white/30">gale</span>
            </div>
          </div>

          {/* Gale Trial — gamified use of the fan physics */}
          <div className="glass px-4 py-3 w-[210px]">
            <div className="flex items-center justify-between mb-2.5 gap-2">
              <span className="text-[0.78rem] text-white/55">Gale trial</span>
              <span
                className={`text-[0.72rem] font-medium ${
                  trial.earned || trial.atGale ? 'text-accent' : 'text-white/35'
                }`}
              >
                {trial.earned
                  ? '✦ Stormproof'
                  : trial.atGale
                    ? `${trial.held.toFixed(1)}s / ${GALE_HOLD_S}s`
                    : 'Locked'}
              </span>
            </div>
            <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-150"
                style={{ width: `${(trial.earned ? 1 : trial.held / GALE_HOLD_S) * 100}%` }}
              />
            </div>
            {!trial.earned && (
              <p className="mt-2.5 text-[0.7rem] leading-relaxed text-white/35">
                Hold the fan at gale for {GALE_HOLD_S}s to earn the Stormproof badge.
              </p>
            )}
          </div>

          {/* Info toggle */}
          <button
            onClick={onInfoToggle}
            className="glass px-3.5 py-2 text-[0.78rem] text-white/60 transition-colors hover:text-white"
          >
            {showInfo ? 'Close info' : 'Tech info'}
          </button>
        </div>
      </div>

      {/* ── Top-right: nav + bag ─────────────────────────────────────────── */}
      <div className="absolute top-4 right-3 sm:top-6 sm:right-6 flex gap-2 sm:gap-3 items-center">
        {([
          { label: 'Collection', view: 'shop' as View },
          { label: 'Lookbook',   view: 'ghost' as View },
        ]).map(item => (
          <button
            key={item.label}
            onClick={() => onNavigate?.(item.view)}
            disabled={!onNavigate}
            className="hidden sm:inline rounded-full px-3 py-1.5 text-[0.85rem] text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-white/60"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={open}
          className="btn-primary px-4 py-1.5 text-[0.85rem]"
        >
          Bag{count > 0 ? ` · ${count}` : ''}
        </button>
      </div>
    </>
  )
}
