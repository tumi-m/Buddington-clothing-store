// FILE: src/App.tsx
// Single-page view-state shell (no router — AGENTS.md). Layers the house-grammar
// editorial screens over the existing 3D cloth experience, which remains a
// reachable view ("EXPERIENCE"). Existing 3D wiring (Scene/UI/InfoPanel) is intact.

import { useState, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './components/Scene'
import { UI } from './components/UI'
import { InfoPanel } from './components/InfoPanel'
import { Nav } from './components/Nav'
import { Home } from './components/Home'
import { Shop } from './components/Shop'
import { ProductDetail } from './components/ProductDetail'
import { GhostCapsule } from './components/GhostCapsule'
import { getProductById } from './data/products'
import { GARMENTS } from './data/garments'
import type { View, Weather, DayNight } from './types'

function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg z-50">
      <div
        className="text-gold text-4xl font-display tracking-ultra-wide mb-4"
        style={{ textShadow: '0 0 40px rgba(201,169,110,0.5)' }}
      >
        BUDDINGTON
      </div>
      <div className="text-xs tracking-widest text-gray-600 animate-pulse">
        LOADING A/W 41 · · ·
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [productId, setProductId] = useState<string | null>(null)
  const [returnView, setReturnView] = useState<View>('home')

  // 3D cloth experience state (existing wiring intact + weather/day-night).
  const [windStrength, setWindStrength] = useState(0.5)
  const [showInfo, setShowInfo] = useState(false)
  const [weather, setWeather] = useState<Weather>('sunny')
  const [dayNight, setDayNight] = useState<DayNight>('day')
  const [selectedGarment, setSelectedGarment] = useState<string>(GARMENTS[0].id)
  const [quality, setQuality] = useState<'high' | 'low'>('high')

  const toggleDayNight = useCallback(() => {
    setDayNight(d => (d === 'day' ? 'night' : 'day'))
  }, [])

  const navigate = useCallback((v: View) => {
    if (view !== 'experience') setReturnView(view)
    setView(v)
    // Reset scroll on view change for the editorial shell.
    if (v !== 'experience') window.scrollTo(0, 0)
  }, [view])

  const openProduct = useCallback((id: string) => {
    setProductId(id)
    setView('product')
    window.scrollTo(0, 0)
  }, [])

  const enterExperience = useCallback((garmentId?: string) => {
    const target = garmentId ?? selectedGarment
    setSelectedGarment(target)
    setView('experience')
  }, [selectedGarment])

  const exitExperience = useCallback(() => {
    setView(returnView)
  }, [returnView])

  // ── 3D cloth experience view (existing wiring, intact) ────────────────────
  if (view === 'experience') {
    return (
      <div className="relative w-full h-full bg-dark-bg select-none">
        <Suspense fallback={<Loader />}>
          <Canvas
            shadows
            dpr={[1, 1.5]}
            gl={{
              antialias:       true,
              alpha:           false,
              outputColorSpace: THREE.SRGBColorSpace,
              powerPreference: 'high-performance',
            }}
            camera={{
              position: [0, 0.2, 6],
              fov:      42,
              near:     0.1,
              // Far plane must clear the SkyDome (r=60) and Stars (r=80), else the
              // sky is clipped and the canvas clear colour (black, alpha:false)
              // shows through — which is what made the background always black.
              far:      200,
            }}
          >
            <Scene
              windStrength={windStrength}
              weather={weather}
              dayNight={dayNight}
              garmentImage={GARMENTS.find(g => g.id === selectedGarment)?.image ?? GARMENTS[0].image}
              quality={quality}
            />
          </Canvas>
        </Suspense>

        <UI
          windStrength={windStrength}
          onWindChange={setWindStrength}
          onInfoToggle={() => setShowInfo(p => !p)}
          showInfo={showInfo}
          onNavigate={navigate}
          weather={weather}
          onWeatherChange={setWeather}
          dayNight={dayNight}
          onDayNightToggle={toggleDayNight}
          garments={GARMENTS}
          selectedGarment={selectedGarment}
          onGarmentChange={setSelectedGarment}
          quality={quality}
          onQualityChange={setQuality}
        />

        {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}

        {/* Exit back to the editorial site — overlay, does not alter UI.tsx */}
        <button
          onClick={exitExperience}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 font-mono uppercase text-[0.65rem] tracking-[0.14em] text-gray-500 hover:text-gold border border-white/10 hover:border-gold px-3 py-1.5 rounded transition-colors focus-visible:outline-gold"
        >
          ← EXIT TO SITE
        </button>
      </div>
    )
  }

  // ── Editorial shell (scrollable, house grammar) ───────────────────────────
  const product = productId ? getProductById(productId) : undefined

  return (
    <div className="absolute inset-0 overflow-y-auto bg-paper text-ink">
      <Nav view={view} onNavigate={navigate} />
      <main>
        {view === 'home' && <Home onNavigate={navigate} />}
        {view === 'shop' && <Shop onOpenProduct={openProduct} onNavigate={navigate} onViewInElements={enterExperience} />}
        {view === 'product' && product && (
          <ProductDetail product={product} onBack={() => navigate('shop')} onViewInElements={enterExperience} />
        )}
        {view === 'product' && !product && (
          <MissingProduct onBack={() => navigate('shop')} />
        )}
        {view === 'ghost' && <GhostCapsule />}
      </main>
    </div>
  )
}

function MissingProduct({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-24 text-center">
      <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-3">
        A41 / NOT FOUND
      </p>
      <p className="font-serif text-ink mb-6" style={{ fontSize: '1.5rem' }}>
        That piece is no longer in the collection.
      </p>
      <button
        onClick={onBack}
        className="font-mono uppercase text-[0.78rem] tracking-[0.14em] text-ink border-b border-ink hover:text-gold hover:border-gold transition-colors pb-1"
      >
        ← THE COLLECTION
      </button>
    </div>
  )
}