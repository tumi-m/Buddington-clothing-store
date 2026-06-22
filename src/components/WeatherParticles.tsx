// FILE: src/components/WeatherParticles.tsx
// Precipitation for rain / snow / hail. Sunny renders nothing.
// Particles drift on the -X wind from the fan, so weather and the fan mechanic
// read together (windtunnel feel). Built from a flat typed array, reset to the
// top of the volume when they fall past the floor.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Weather } from '../types'

interface WeatherParticlesProps {
  weather: Weather
  windStrength: number
}

interface Cfg {
  count: number
  color: string
  size: number
  fall: number   // units / second
  sway: number
  opacity: number
}

const CFG: Record<Weather, Cfg> = {
  sunny: { count: 0,   color: '#ffffff', size: 0,    fall: 0,    sway: 0,    opacity: 0 },
  windy: { count: 0,   color: '#ffffff', size: 0,    fall: 0,    sway: 0,    opacity: 0 },
  rain:  { count: 1500, color: '#a6c6ee', size: 0.025, fall: 15,  sway: 0.02, opacity: 0.7 },
  snow:  { count: 800,  color: '#dfe6ee', size: 0.035, fall: 2.8, sway: 0.18, opacity: 0.6 },
  hail:  { count: 500,  color: '#d4dce3', size: 0.06,  fall: 23,  sway: 0.03, opacity: 0.95 },
}

// Volume around the cloth + in front toward the camera.
const VOL = { x: 4, yTop: 3.4, yBase: -2.0, z: 3 }

export function WeatherParticles({ weather, windStrength }: WeatherParticlesProps) {
  const ref = useRef<THREE.Points>(null)
  const timeRef = useRef(0)
  const cfg = CFG[weather]

  const positions = useMemo(() => {
    const n = cfg.count
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * VOL.x
      arr[i * 3 + 1] = Math.random() * (VOL.yTop - VOL.yBase) + VOL.yBase
      arr[i * 3 + 2] = (Math.random() - 0.5) * VOL.z
    }
    return arr
  }, [cfg.count])

  const speeds = useMemo(() => {
    const n = cfg.count
    const arr = new Float32Array(n) // per-particle fall speed multiplier
    for (let i = 0; i < n; i++) arr[i] = 0.75 + Math.random() * 0.5
    return arr
  }, [cfg.count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((_, delta) => {
    if (!ref.current || cfg.count === 0) return
    const dt = Math.min(delta, 0.05)
    timeRef.current += dt
    const arr = geo.attributes.position.array as Float32Array
    const wind = -windStrength * 4 // fan blows -X
    const t = timeRef.current

    for (let i = 0; i < cfg.count; i++) {
      const ix = i * 3
      arr[ix]     += (wind + Math.sin(t * 1.3 + i) * cfg.sway) * dt
      arr[ix + 1] -= cfg.fall * speeds[i] * dt
      arr[ix + 2] += Math.sin(t * 0.9 + i * 0.7) * cfg.sway * 0.3 * dt

      if (arr[ix + 1] < VOL.yBase - 0.3) {
        arr[ix]     = (Math.random() - 0.5) * VOL.x
        arr[ix + 1] = VOL.yTop
        arr[ix + 2] = (Math.random() - 0.5) * VOL.z
      }
      if (arr[ix] < -VOL.x) arr[ix] = VOL.x
      else if (arr[ix] > VOL.x) arr[ix] = -VOL.x
    }
    geo.attributes.position.needsUpdate = true
  })

  if (cfg.count === 0) return null

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color={cfg.color}
        size={cfg.size}
        transparent
        opacity={cfg.opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}