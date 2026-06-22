import { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE_TYPES from 'three'
import * as THREE from 'three'
import { ClothMesh } from './ClothMesh'
import { Fan } from './Fan'
import { SkyDome } from './SkyDome'
import { WeatherParticles } from './WeatherParticles'
import { Nature } from './Nature'
import { useGarmentTexture } from '../hooks/useGarmentTexture'
import type { Weather, DayNight } from '../types'

interface SceneProps {
  windStrength: number
  weather: Weather
  dayNight: DayNight
  /** Selected garment image path (which piece of clothing is on the cloth). */
  garmentImage: string
  /** Quality level for adaptive performance scaling. */
  quality?: 'high' | 'low'
  /** Wind-tunnel mode — garment floats suspended in the fan's airflow. */
  suspended?: boolean
}


const FAN_POSITION = new THREE.Vector3(2.8, 0, 0.4)

interface Env {
  sky: { top: string; horizon: string }
  ambient: number
  key: { intensity: number; color: string }
  rim: { intensity: number; color: string }
  fill: { intensity: number; color: string }
  exposure: number
  floor: string
  gridCenter: string
  grid: string
  shadowOpacity: number
}

function envFor(weather: Weather, dayNight: DayNight): Env {
  const night = dayNight === 'night'

  const sky = night
    ? { top: '#04060d', horizon: '#0e1730' }
    : weather === 'sunny' ? { top: '#1d6cf0', horizon: '#cfe9ff' }
    : weather === 'windy' ? { top: '#5b86b5', horizon: '#c4d4e0' }
    : weather === 'rain'  ? { top: '#58616f', horizon: '#9aa3ad' }
    : weather === 'snow'  ? { top: '#454d57', horizon: '#6e7782' }   // deeper grey-blue for contrast against the snow
    :                       { top: '#414953', horizon: '#787f88' } // hail

  if (night) {
    return {
      sky,
      ambient: 0.2,
      key: { intensity: 0.5, color: '#9fb4d4' },
      rim: { intensity: 0.3, color: '#c9a44c' },
      fill: { intensity: 0.25, color: '#3a4a6b' },
      exposure: 1.4,
      floor: '#0a0c12',
      gridCenter: '#2a3550',
      grid: '#1a2238',
      shadowOpacity: 0.55,
    }
  }

  if (weather === 'sunny') {
    return {
      sky,
      ambient: 0.55,
      key: { intensity: 1.8, color: '#fff5e0' },
      rim: { intensity: 0.6, color: '#c9a44c' },
      fill: { intensity: 0.5, color: '#8ab4d4' },
      exposure: 1.05,
      floor: '#c9cdd2',
      gridCenter: '#7e858d',
      grid: '#aeb4ba',
      shadowOpacity: 0.3,
    }
  }

  if (weather === 'windy') {
    // Brisk, blustery clear day — no precipitation (the wind slider / fan
    // carry the motion). Slightly cooler & flatter than sunny.
    return {
      sky,
      ambient: 0.5,
      key: { intensity: 1.5, color: '#f3eede' },
      rim: { intensity: 0.5, color: '#c9a44c' },
      fill: { intensity: 0.5, color: '#9fb4d4' },
      exposure: 1.05,
      floor: '#c2c6cc',
      gridCenter: '#828a92',
      grid: '#b0b6bc',
      shadowOpacity: 0.32,
    }
  }

  if (weather === 'snow') {
    // Overcast snow — deliberately darker than the falling snow so the flakes
    // and garment read with contrast instead of washing the frame to white.
    // Lower exposure + ambient, deeper ground, firmer key for separation.
    return {
      sky,
      ambient: 0.3,
      key: { intensity: 1.05, color: '#cfd8e2' },
      rim: { intensity: 0.4, color: '#c9a44c' },
      fill: { intensity: 0.34, color: '#8aa0c0' },
      exposure: 0.8,
      floor: '#969ca4',
      gridCenter: '#6c727a',
      grid: '#8f959d',
      shadowOpacity: 0.42,
    }
  }

  // overcast day (rain / hail)
  return {
    sky,
    ambient: 0.42,
    key: { intensity: 1.1, color: '#dfe7f0' },
    rim: { intensity: 0.4, color: '#c9a44c' },
    fill: { intensity: 0.45, color: '#9fb4d4' },
    exposure: 1.1,
    floor: '#b8bcc2',
    gridCenter: '#878d95',
    grid: '#b3b9bf',
    shadowOpacity: 0.32,
  }
}

export function Scene({ windStrength, weather, dayNight, garmentImage, quality = 'high', suspended = true }: SceneProps) {
  const { gl } = useThree()
  const texture = useGarmentTexture(garmentImage)
  const env = useMemo(() => envFor(weather, dayNight), [weather, dayNight])

  // Shadow-map quality + tone mapping exposure (re-applied when day/night changes)
  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type      = THREE.PCFSoftShadowMap
    gl.toneMapping         = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = env.exposure
  }, [gl, env.exposure])

  return (
    <>
      {/* ── Sky + weather ─────────────────────────────────────────────── */}
      <SkyDome top={env.sky.top} horizon={env.sky.horizon} />
      {dayNight === 'night' && (
        <Stars radius={80} depth={50} count={2500} factor={4} saturation={0} fade speed={0.5} />
      )}
      <WeatherParticles weather={weather} windStrength={windStrength} quality={quality} />

      {/* ── Lights ──────────────────────────────────────────────────────── */}
      <ambientLight intensity={env.ambient} />

      {/* Key light — warm in sun, cool in overcast/night */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={env.key.intensity}
        color={env.key.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Rim light — house gold */}
      <directionalLight
        position={[3, -2, 3]}
        intensity={env.rim.intensity}
        color={env.rim.color}
      />

      {/* Fill light — cool from left */}
      <directionalLight
        position={[-5, 2, 1]}
        intensity={env.fill.intensity}
        color={env.fill.color}
      />

      {/* ── Cloth ───────────────────────────────────────────────────────── */}
      <ClothMesh
        windStrength={windStrength}
        weather={weather}
        fanPosition={FAN_POSITION}
        texture={texture}
        quality={quality}
        suspended={suspended}
      />

      {/* ── Fan ─────────────────────────────────────────────────────────── */}
      <Fan position={FAN_POSITION} windStrength={windStrength} />

      {/* ── Ground shadow (soft blob under the hanging cloth) ──────────── */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={env.shadowOpacity}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* ── Lush nature ground (replaces the windtunnel floor) ──────────── */}
      <Nature weather={weather} dayNight={dayNight} quality={quality} />

      {/* ── Environment (HDRI reflections only) ──────────────────────────── */}
      <Environment preset="studio" background={false} />

      {/* ── Camera controls ──────────────────────────────────────────────── */}
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.80}
        minAzimuthAngle={-Math.PI * 0.55}
        maxAzimuthAngle={Math.PI * 0.55}
        minDistance={3.5}
        maxDistance={9}
        enablePan={false}
        dampingFactor={0.06}
        enableDamping
      />

      {/* ── Post-processing ──────────────────────────────────────────────── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          intensity={0.32}
          blendFunction={BlendFunction.ADD}
        />
        <ChromaticAberration
          offset={new THREE_TYPES.Vector2(0.0003, 0.0003)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette offset={0.32} darkness={dayNight === 'night' ? 0.5 : 0.4} />
      </EffectComposer>
    </>
  )
}