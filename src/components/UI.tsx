import { useState } from 'react'

interface UIProps {
  windStrength: number
  onWindChange: (v: number) => void
  onInfoToggle: () => void
  showInfo: boolean
}

export function UI({ windStrength, onWindChange, onInfoToggle, showInfo }: UIProps) {
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

      {/* ── Controls panel (bottom-right) ────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">

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
        {['COLLECTION', 'LOOKBOOK', 'STORES'].map(item => (
          <button
            key={item}
            className="text-xs tracking-widest text-gray-600 hover:text-gold transition-colors duration-200 font-light"
          >
            {item}
          </button>
        ))}
        <button className="text-xs tracking-widest border border-gold text-gold px-4 py-1.5 hover:bg-gold hover:text-black transition-all duration-200">
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
