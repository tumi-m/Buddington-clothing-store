import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './components/Scene'
import { UI } from './components/UI'
import { InfoPanel } from './components/InfoPanel'

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
  const [windStrength, setWindStrength] = useState(0.5)
  const [showInfo,     setShowInfo]     = useState(false)

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
            far:      50,
          }}
        >
          <Scene windStrength={windStrength} />
        </Canvas>
      </Suspense>

      {/* Overlay UI — always on top of canvas */}
      <UI
        windStrength={windStrength}
        onWindChange={setWindStrength}
        onInfoToggle={() => setShowInfo(p => !p)}
        showInfo={showInfo}
      />

      {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
    </div>
  )
}
