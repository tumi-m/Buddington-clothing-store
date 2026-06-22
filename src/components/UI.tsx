import { useState } from 'react'
import type { View, Weather, DayNight } from '../types'
import type { Garment } from '../data/garments'
import { GarmentCarousel } from './GarmentCarousel'

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
  /** Optional garment selector — which piece of clothing is on the cloth. */
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

  const toggleFan = () => {
    const next = !fanOn
    setFanOn(next)
    onWindChange(next ? 0.5 : 0)
  }

  return (
    <>
      {/* ── Brand wordmark (top-left) ─────────────────────────────────────── */}
      <div className="absolute top-6 left-6 pointer-events-none select-none">
        <div
          className="text-gold tracking-ultra-wide text-2xl font-serif leading-none"
          style={{ textShadow: '0 0 30px rgba(201,169,110,0.4)' }}
        >
          BUDDINGTON
        </div>
        <div className="text-xs tracking-widest text-gray-600 mt-1 font-light">
          A/W 41 COLLECTION
        </div>
      </div>

      {/* Garment metadata is intentionally omitted here — the wind-tunnel view
          shows only the suspended render (reference: yeezy.com). Selection is
          driven by the image-only carousel below. */}

      {/* ── Controls panel (bottom-right) ────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">

        {/* Quality toggle */}
        {onQualityChange && quality && (
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded px-4 py-2">
            <div className="flex items-center justify-between">
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
          <div className="bg-black/60 backdrop-blur-md border border-white/[0.08] rounded px-4 py-3 min-w-[210px]">
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
            <div className="flex gap-1.5">
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

        {/* Wind control */}
        <div className="bg-black/60 backdrop-blur-md border border-white/[0.08] rounded px-4 py-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-widest text-gray-400 font-light uppercase">Wind</span>
            <button
              onClick={toggleFan}
              className={`text-xs tracking-wider px-2 py-0.5 border rounded transition-all duration-200 ${
                fanOn
                  ? 'border-gold text-gold'
                  : 'border-gray-700 text-gray-600'
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
          className="text-xs tracking-widest border border-white/10 text-gray-500 px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-all duration-200"
        >
          {showInfo ? 'CLOSE INFO' : 'TECH INFO'}
        </button>
      </div>

      {/* ── Garment carousel (bottom filmstrip) ───────────────────────────── */}
      {garments && onGarmentChange && (
        <GarmentCarousel
          garments={garments}
          selectedGarment={selectedGarment ?? garments[0]?.id ?? ''}
          onGarmentChange={onGarmentChange}
        />
      )}

      {/* ── Top-right nav ────────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 flex gap-6 items-center">
        {([
          { label: 'COLLECTION', view: 'shop' as View },
          { label: 'LOOKBOOK',    view: 'ghost' as View },
          { label: 'STORES',      view: 'home' as View },
        ]).map(item => (
          <button
            key={item.label}
            onClick={() => onNavigate?.(item.view)}
            disabled={!onNavigate}
            className="text-xs tracking-widest text-gray-600 hover:text-gold transition-colors duration-200 font-light disabled:cursor-default disabled:hover:text-gray-600"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => onNavigate?.('shop')}
          disabled={!onNavigate}
          className="text-xs tracking-widest border border-gold text-gold px-4 py-1.5 hover:bg-gold hover:text-black transition-all duration-200 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          SHOP
        </button>
      </div>

    </>
  )
}
