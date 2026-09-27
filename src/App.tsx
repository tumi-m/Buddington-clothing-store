// FILE: src/App.tsx
// Single-page view-state shell (no router — AGENTS.md). Layers the house-grammar
// editorial screens over the existing 3D cloth experience, which remains a
// reachable view ("EXPERIENCE"). Existing 3D wiring (Scene/UI/InfoPanel) is intact.

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
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
import { CartDrawer } from './components/CartDrawer'
import { AddedToast } from './components/AddedToast'
import { FlightHUD } from './components/FlightHUD'
import { useScrollFlight } from './hooks/useScrollFlight'
import { useScrollChrome } from './hooks/useScrollChrome'
import { useMusicDockPlacement } from './music/MusicContext'
import { getProductById } from './data/products'
import { GARMENTS } from './data/garments'
import type { View, Weather, DayNight } from './types'

// The journey drives the elements: each flight chapter sweeps the scene
// through the weather system and fan physics — calm sky, rising wind on the
// descent, rain over the ground, full-gale hail at THE CURRENT, then a
// clearing calm as the camera settles on the garment.
const CHAPTER_ELEMENTS: readonly { weather: Weather; wind: number }[] = [
  { weather: 'sunny', wind: 0.25 }, // I   — THE SKY
  { weather: 'windy', wind: 0.7 },  // II  — THE DESCENT
  { weather: 'rain',  wind: 0.5 },  // III — THE GROUND
  { weather: 'hail',  wind: 1.0 },  // IV  — THE CURRENT
  { weather: 'sunny', wind: 0.5 },  // V   — THE GARMENT
]

function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg z-50">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-base font-semibold text-white"
          aria-hidden="true"
        >
          B
        </span>
        <span className="text-2xl font-semibold tracking-tight text-white">Buddington</span>
      </div>
      <div className="text-xs text-gray-500 animate-pulse">Loading A/W 41…</div>
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

  // The editorial shell is its own scroll container (the document never
  // scrolls), so view changes reset this element rather than the window.
  const scrollerRef = useRef<HTMLDivElement>(null)
  const resetScroll = useCallback(() => {
    scrollerRef.current?.scrollTo({ top: 0 })
  }, [])

  // Publishes scroll progress + a scrolled flag onto the container for the
  // progress rail and the condensing nav to read in CSS.
  useScrollChrome(scrollerRef)

  // Scroll-scrubbed entry flight for the experience view (scroll-world engine).
  // Replays on each entry; skipped entirely under prefers-reduced-motion.
  const flight = useScrollFlight(view === 'experience')

  // Keep the sound dock clear of each view's own controls and text.
  useMusicDockPlacement(view === 'experience' ? 'immersive' : 'editorial')

  // While the flight owns the camera, its chapters drive weather + wind.
  // After landing (or under reduced motion) the user is back in control.
  useEffect(() => {
    if (view !== 'experience' || flight.done) return
    const preset = CHAPTER_ELEMENTS[flight.chapter]
    setWeather(preset.weather)
    setWindStrength(preset.wind)
  }, [view, flight.chapter, flight.done])

  const toggleDayNight = useCallback(() => {
    setDayNight(d => (d === 'day' ? 'night' : 'day'))
  }, [])

  const navigate = useCallback((v: View) => {
    if (view !== 'experience') setReturnView(view)
    setView(v)
    // Reset scroll on view change. The editorial shell scrolls inside its own
    // container, not the document, so window.scrollTo would do nothing here.
    if (v !== 'experience') resetScroll()
  }, [view])

  const openProduct = useCallback((id: string) => {
    setProductId(id)
    setView('product')
    resetScroll()
  }, [])

  const enterExperience = useCallback((garmentId?: string) => {
    const target = garmentId ?? selectedGarment
    setSelectedGarment(target)
    setView('experience')
  }, [selectedGarment])

  const exitExperience = useCallback(() => {
    setView(returnView)
  }, [returnView])

  // Escape leaves the immersive view. Without it the only way out is a small
  // overlay button, which is a trap for keyboard users.
  useEffect(() => {
    if (view !== 'experience') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitExperience()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, exitExperience])

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
              flightProgress={flight.progress}
              flightActive={!flight.done}
            />
          </Canvas>
        </Suspense>

        {/* UI stays live during the flight — carousel, garment info and bag are
            always present; only the settings stack waits for landing. */}
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
          flightActive={!flight.done}
        />

        {/* Scroll-flight HUD — flight log, accent progress hairline, skip. */}
        <FlightHUD
          progress={flight.progress}
          done={flight.done}
          chapter={flight.chapter}
          maxChapter={flight.maxChapter}
          onSkip={flight.skip}
        />

        {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}

        {/* Exit back to the editorial site — overlay, does not alter UI.tsx */}
        <button
          onClick={exitExperience}
          className="absolute bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 sm:bottom-auto sm:top-6 sm:left-1/2 sm:-translate-x-1/2 z-50 text-[0.8rem] text-white/70 hover:text-white border border-white/15 hover:border-white/30 px-4 py-2 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md transition-colors focus-visible:outline-accent"
        >
          ← Exit<span className="hidden sm:inline"> to site</span>
        </button>

        <CartDrawer />
        <AddedToast />
      </div>
    )
  }

  // ── Editorial shell (scrollable, house grammar) ───────────────────────────
  const product = productId ? getProductById(productId) : undefined

  return (
    <div ref={scrollerRef} className="absolute inset-0 overflow-y-auto bg-paper text-ink">
      {/* Keyboard users can jump the nav straight to the page content. */}
      <a
        href="#main"
        className="sr-only-focusable btn-primary absolute left-4 top-4 z-50"
      >
        Skip to content
      </a>
      <Nav view={view} onNavigate={navigate} />
      {/* `key` restarts the entrance animation on every view change. */}
      <main id="main" key={view} className="view-enter">
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

      <CartDrawer />
      <AddedToast />
    </div>
  )
}

function MissingProduct({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="pill mx-auto">A41 / Not found</p>
      <p className="mt-5 text-[1.5rem] font-medium text-ink">
        That piece is no longer in the collection.
      </p>
      <button onClick={onBack} className="btn-primary mt-7">
        Back to the collection
      </button>
    </div>
  )
}