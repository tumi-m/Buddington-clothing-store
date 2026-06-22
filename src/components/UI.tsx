import { useState } from 'react'
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
}

export function UI({
  windStrength, onWindChange, onInfoToggle, showInfo,
  onNavigate, weather, onWeatherChange, dayNight, onDayNightToggle,
  quality, onQualityChange,
  garments, selectedGarment, onGarmentChange,
}: UIProps) {
  const [fanOn, setFanOn] = useState(true)
  const [controlsOpen, setControlsOpen] = useState(false)   // mobile: collapse the control stack
  const { count, open, addItem } = useCart()

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
        <div
          className="text-gold tracking-[0.35em] sm:tracking-ultra-wide text-lg sm:text-2xl font-serif leading-none"
          style={{ textShadow: '0 0 30px rgba(201,169,110,0.4)' }}
        >
          BUDDINGTON
        </div>
        <div className="hidden sm:block text-xs tracking-widest text-gray-600 mt-1 font-light">
          A/W 41 · IN THE ELEMENTS
        </div>
      </div>

      {/* ── GTA-style garment toggles (one on each side) ──────────────────── */}
      {garments && garments.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous garment"
            onClick={() => step(-1)}
            className="group absolute left-1 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-16 flex items-center justify-center text-paper/45 hover:text-gold transition-colors focus-visible:outline-gold"
          >
            <span className="text-3xl sm:text-4xl font-thin leading-none group-active:-translate-x-1 transition-transform">❮</span>
          </button>
          <button
            type="button"
            aria-label="Next garment"
            onClick={() => step(1)}
            className="group absolute right-1 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-16 flex items-center justify-center text-paper/45 hover:text-gold transition-colors focus-visible:outline-gold"
          >
            <span className="text-3xl sm:text-4xl font-thin leading-none group-active:translate-x-1 transition-transform">❯</span>
          </button>
        </>
      )}

      {/* ── Active piece — code / price / add (above the carousel) ─────────── */}
      {current && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[6.5rem] sm:bottom-[7.5rem] z-30 flex flex-col items-center gap-1.5 select-none pointer-events-none">
          <p className="font-mono uppercase text-[0.7rem] tracking-[0.2em] text-paper">{current.code}</p>
          <p className="font-mono text-gold text-[0.8rem]">{current.price}</p>
          <button
            type="button"
            onClick={addCurrent}
            aria-label={`Add ${current.code} to bag`}
            className="pointer-events-auto mt-0.5 w-9 h-9 flex items-center justify-center text-2xl font-thin leading-none text-paper border border-paper/30 rounded-full hover:bg-paper hover:text-black transition-colors focus-visible:outline-gold"
          >
            +
          </button>
        </div>
      )}

      {/* ── Carousel of 3D-rendered garments (bottom, swipeable) ──────────── */}
      {garments && onGarmentChange && garments.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 sm:bottom-3 z-20 pointer-events-none">
          <div className="mx-auto w-full sm:max-w-2xl pointer-events-auto">
            <GarmentStrip
              garments={garments}
              selectedId={selectedGarment ?? garments[0]?.id ?? ''}
              onSelect={onGarmentChange}
            />
          </div>
        </div>
      )}

      {/* ── Controls (bottom-right on desktop · collapsible top-right on mobile) ── */}
      <div className="absolute right-3 md:right-6 top-16 md:top-auto md:bottom-6 z-40 flex flex-col gap-2 md:gap-3 items-end">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setControlsOpen(o => !o)}
          aria-expanded={controlsOpen}
          className="md:hidden bg-black/60 backdrop-blur-md border border-white/10 rounded px-3 py-1.5 text-[10px] tracking-widest text-gold uppercase"
        >
          {controlsOpen ? '✕ CLOSE' : '⚙ CONTROLS'}
        </button>

        <div className={`${controlsOpen ? 'flex' : 'hidden'} md:flex flex-col gap-2 md:gap-3 items-end`}>
          {/* Quality toggle */}
          {onQualityChange && quality && (
            <div className="bg-black/55 backdrop-blur-md border border-white/10 rounded px-4 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] tracking-widest text-gray-400 font-light uppercase">Quality</span>
                <button
                  onClick={() => onQualityChange(quality === 'high' ? 'low' : 'high')}
                  className="text-[10px] tracking-wider px-2 py-0.5 border rounded transition-all duration-200 border-gold text-gold hover:bg-gold hover:text-black"
                >
                  {quality === 'high' ? 'HIGH' : 'LOW'}
                </button>
              </div>
            </div>
          )}

          {/* Weather selector + day/night */}
          {onWeatherChange && weather && (
            <div className="bg-black/55 backdrop-blur-md border border-white/[0.08] rounded px-4 py-3 w-[210px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-widest text-gray-400 font-light uppercase">Weather</span>
                {onDayNightToggle && dayNight && (
                  <button
                    onClick={onDayNightToggle}
                    className="text-[10px] tracking-wider px-2 py-0.5 border rounded transition-all duration-200 border-gold text-gold hover:bg-gold hover:text-black"
                  >
                    {dayNight === 'day' ? '☀ DAY' : '☾ NIGHT'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['sunny', 'windy', 'rain', 'snow', 'hail'] as Weather[]).map(w => (
                  <button
                    key={w}
                    onClick={() => onWeatherChange(w)}
                    className={`text-[10px] tracking-wider px-2 py-0.5 border rounded transition-all duration-200 ${
                      weather === w
                        ? 'border-gold text-gold'
                        : 'border-gray-700 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {w.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wind / fan control */}
          <div className="bg-black/55 backdrop-blur-md border border-white/[0.08] rounded px-4 py-3 w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-widest text-gray-400 font-light uppercase">Fan</span>
              <button
                onClick={toggleFan}
                className={`text-xs tracking-wider px-2 py-0.5 border rounded transition-all duration-200 ${
                  fanOn ? 'border-gold text-gold' : 'border-gray-700 text-gray-600'
                }`}
              >
                {fanOn ? 'ON' : 'OFF'}
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
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-700">calm</span>
              <span className="text-xs text-gray-700">gale</span>
            </div>
          </div>

          {/* Info toggle */}
          <button
            onClick={onInfoToggle}
            className="text-xs tracking-widest border border-white/10 text-gray-500 px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-all duration-200 bg-black/40 backdrop-blur-md"
          >
            {showInfo ? 'CLOSE INFO' : 'TECH INFO'}
          </button>
        </div>
      </div>

      {/* ── Top-right: nav + bag ─────────────────────────────────────────── */}
      <div className="absolute top-4 right-3 sm:top-6 sm:right-6 flex gap-4 sm:gap-6 items-center">
        {([
          { label: 'COLLECTION', view: 'shop' as View },
          { label: 'LOOKBOOK',    view: 'ghost' as View },
        ]).map(item => (
          <button
            key={item.label}
            onClick={() => onNavigate?.(item.view)}
            disabled={!onNavigate}
            className="hidden sm:inline text-xs tracking-widest text-gray-600 hover:text-gold transition-colors duration-200 font-light disabled:cursor-default disabled:hover:text-gray-600"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={open}
          className="text-[0.65rem] sm:text-xs tracking-widest border border-gold text-gold px-3 sm:px-4 py-1.5 hover:bg-gold hover:text-black transition-all duration-200"
        >
          BAG{count > 0 ? ` · ${count}` : ''}
        </button>
      </div>
    </>
  )
}
