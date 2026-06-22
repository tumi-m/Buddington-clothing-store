import { useState } from 'react'
import type { View, Weather, DayNight } from '../types'
import type { Garment } from '../data/garments'

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
  /** Optional garment selector — which piece of clothing is on the cloth. */
  garments?: Garment[]
  selectedGarment?: string
  onGarmentChange?: (id: string) => void
}

export function UI({
  windStrength, onWindChange, onInfoToggle, showInfo,
  onNavigate, weather, onWeatherChange, dayNight, onDayNightToggle,
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
          className="text-gold tracking-ultra-wide text-2xl font-display leading-none"
          style={{ textShadow: '0 0 30px rgba(201,169,110,0.4)' }}
        >
          BUDDINGTON
        </div>
        <div className="text-xs tracking-widest text-gray-600 mt-1 font-light">
          A/W 41 COLLECTION
        </div>
      </div>

      {/* ── Garment selector (top-left, below the wordmark) ───────────────── */}
      {garments && onGarmentChange && selectedGarment && (
        <div className="absolute top-24 left-6 bg-black/60 backdrop-blur-md border border-white/8 rounded px-4 py-3 w-[230px] max-h-[calc(100vh-12rem)] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs tracking-widest text-gray-400 font-light uppercase">Garment</span>
            <span className="text-[9px] tracking-wider text-gray-600 uppercase">A/W 41</span>
          </div>
          <div className="overflow-y-auto pr-1 -mr-1 flex flex-col gap-1">
            {garments.map(g => {
              const active = g.id === selectedGarment
              return (
                <button
                  key={g.id}
                  onClick={() => onGarmentChange(g.id)}
                  className={`text-left px-2 py-1.5 rounded transition-all duration-200 border ${
                    active
                      ? 'border-gold bg-gold/10 text-paper'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="font-mono text-[0.6rem] tracking-[0.14em] text-gold leading-tight">
                    {g.code}
                  </div>
                  <div className="font-mono text-[0.72rem] tracking-wide leading-tight">
                    {g.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Controls panel (bottom-right) ────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">

        {/* Weather selector + day/night */}
        {onWeatherChange && weather && (
          <div className="bg-black/60 backdrop-blur-md border border-white/8 rounded px-4 py-3 min-w-[210px]">
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
        <div className="bg-black/60 backdrop-blur-md border border-white/8 rounded px-4 py-3 min-w-[200px]">
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

        {/* Interaction hint */}
        <div className="text-xs text-gray-700 tracking-wider text-right">
          <span className="text-gray-600">drag</span> to orbit ·{' '}
          <span className="text-gray-600">hover</span> cloth for ripples ·{' '}
          <span className="text-gray-600">click</span> to push
        </div>

        {/* Info toggle */}
        <button
          onClick={onInfoToggle}
          className="text-xs tracking-widest border border-white/10 text-gray-500 px-3 py-1.5 rounded hover:border-gold hover:text-gold transition-all duration-200"
        >
          {showInfo ? 'CLOSE INFO' : 'TECH INFO'}
        </button>
      </div>

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

      {/* ── Bottom-left credits ──────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 text-xs text-gray-800 tracking-wider pointer-events-none">
        <span className="text-gray-700">Three.js + React Three Fiber</span>
        <br />
        <span>Cloth simulation · Verlet integration</span>
      </div>
    </>
  )
}
