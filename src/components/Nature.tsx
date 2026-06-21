// FILE: src/components/Nature.tsx
// Lush pastoral ground for the experience scene: green grass, daisies,
// coloured flowers, trees, bushes, a pond with lily pads, rocks, and low-poly
// hippos & cows. Replaces the old grey windtunnel floor (which washed out the
// white fan). All geometry is built from 3D primitives — no image assets.
//
// NOTE: this is a deliberate departure from the restrained Buddington house
// grammar, per the user's explicit "luscious nature" direction. The grass
// tint adapts to the weather + day-night toggle.

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Weather, DayNight } from '../types'

const GROUND_Y = -2.2

function rand(min: number, max: number): number { return min + Math.random() * (max - min) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// Grass base colour per weather / day-night — keeps the ground "adaptable".
function grassTone(weather: Weather, dayNight: DayNight): string {
  if (dayNight === 'night') return '#1f3320'
  switch (weather) {
    case 'sunny': return '#4f8a3a'
    case 'windy': return '#4a7f37'
    case 'rain':  return '#36582b'
    case 'snow':  return '#7e9a6e'
    case 'hail':  return '#2f4a25'
  }
}

interface NatureProps {
  weather: Weather
  dayNight: DayNight
}

export function Nature({ weather, dayNight }: NatureProps) {
  const grass = grassTone(weather, dayNight)
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color={grass} roughness={1} />
      </mesh>

      <GrassField base={grass} />
      <Daisies />
      <Flowers />
      <Trees />
      <Bushes />
      <Rocks />
      <Pond position={[-7, GROUND_Y, -3.5]} />
      <Hippo position={[-5.2, GROUND_Y, -2.4]} rotation={-0.3} />
      <Hippo position={[-8.4, GROUND_Y, -5.2]} rotation={0.7} scale={0.82} />
      <Cow position={[6.5, GROUND_Y, -2.5]} rotation={-0.5} />
      <Cow position={[8.8, GROUND_Y, 1.6]} rotation={0.4} scale={0.9} />
    </group>
  )
}

// ── Grass blades (instanced for density) ──────────────────────────────────────
function GrassField({ base }: { base: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const COUNT = 500
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const blades = useMemo(() => {
    return Array.from({ length: COUNT }, () => {
      const a = Math.random() * Math.PI * 2
      const r = rand(2.5, 28)
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rot: Math.random() * Math.PI,
        s: rand(0.5, 1.4),
      }
    })
  }, [])

  useLayoutEffect(() => {
    if (!ref.current) return
    blades.forEach((b, i) => {
      dummy.position.set(b.x, GROUND_Y + b.s * 0.25, b.z)
      dummy.rotation.set(0, b.rot, 0)
      dummy.scale.set(b.s, b.s, b.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [blades, dummy])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <coneGeometry args={[0.035, 0.5, 4]} />
      <meshStandardMaterial color={base} roughness={0.95} />
    </instancedMesh>
  )
}

// ── Daisies ────────────────────────────────────────────────────────────────────
const DAISY_COLORS = ['#ffffff', '#f4f1ea', '#f0ead6']

function Daisies() {
  const items = useMemo(() => Array.from({ length: 45 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(3, 24)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.7, 1.2), c: pick(DAISY_COLORS) }
  }), [])
  return (
    <>
      {items.map((d, i) => (
        <group key={i} position={[d.x, GROUND_Y, d.z]} scale={d.s}>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.012, 0.016, 0.55, 5]} />
            <meshStandardMaterial color="#3d6b2f" />
          </mesh>
          <mesh position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.015, 12]} />
            <meshStandardMaterial color={d.c} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.575, 0]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#e8b94e" />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Coloured flowers (5 petals + golden centre) ────────────────────────────────
const FLOWER_COLORS = ['#d96a8e', '#e08a3c', '#8a6ad9', '#d93b3b', '#e8c14e', '#5e9ad9']

function Flowers() {
  const items = useMemo(() => Array.from({ length: 32 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(3.5, 25)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.7, 1.3), c: pick(FLOWER_COLORS) }
  }), [])
  return (
    <>
      {items.map((d, i) => (
        <group key={i} position={[d.x, GROUND_Y, d.z]} scale={d.s}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.014, 0.018, 0.6, 5]} />
            <meshStandardMaterial color="#3d6b2f" />
          </mesh>
          {[0, 1, 2, 3, 4].map(k => {
            const a = (k / 5) * Math.PI * 2
            return (
              <mesh key={k} position={[Math.cos(a) * 0.07, 0.62, Math.sin(a) * 0.07]}>
                <sphereGeometry args={[0.045, 6, 6]} />
                <meshStandardMaterial color={d.c} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#e8b94e" />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Trees ─────────────────────────────────────────────────────────────────────
function Trees() {
  const items = useMemo(() => Array.from({ length: 7 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(9, 27)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.8, 1.6) }
  }), [])
  return (
    <>
      {items.map((d, i) => (
        <group key={i} position={[d.x, GROUND_Y, d.z]} scale={d.s}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.4, 8]} />
            <meshStandardMaterial color="#6b4a2a" roughness={1} />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshStandardMaterial color="#3f6f2f" roughness={1} />
          </mesh>
          <mesh position={[0.45, 1.95, 0.1]} castShadow>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#4f8a3a" roughness={1} />
          </mesh>
          <mesh position={[-0.4, 1.85, -0.1]} castShadow>
            <sphereGeometry args={[0.45, 12, 12]} />
            <meshStandardMaterial color="#356b27" roughness={1} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Bushes ─────────────────────────────────────────────────────────────────────
function Bushes() {
  const items = useMemo(() => Array.from({ length: 10 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(4, 27)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.5, 1.1) }
  }), [])
  return (
    <>
      {items.map((d, i) => (
        <group key={i} position={[d.x, GROUND_Y, d.z]} scale={d.s}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.4, 10, 8]} />
            <meshStandardMaterial color="#3d6b2f" roughness={1} />
          </mesh>
          <mesh position={[0.28, 0.15, 0.1]} castShadow>
            <sphereGeometry args={[0.3, 10, 8]} />
            <meshStandardMaterial color="#4f8a3a" roughness={1} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Rocks ──────────────────────────────────────────────────────────────────────
function Rocks() {
  const items = useMemo(() => Array.from({ length: 5 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(4, 26)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.4, 0.9), r: rand(0, Math.PI) }
  }), [])
  return (
    <>
      {items.map((d, i) => (
        <mesh
          key={i}
          position={[d.x, GROUND_Y + 0.1 * d.s, d.z]}
          rotation={[0, d.r, 0]}
          scale={[d.s, d.s * 0.7, d.s]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#8a8780" roughness={1} />
        </mesh>
      ))}
    </>
  )
}

// ── Pond with lily pads ────────────────────────────────────────────────────────
function Pond({ position }: { position: [number, number, number] }) {
  const lilies: [number, number][] = [[0.8, 0.6], [-1.2, -0.5], [1.6, -1.2], [-0.4, 1.5], [1.0, 1.0]]
  return (
    <group position={position} scale={[1.4, 1, 1.05]}>
      {/* water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[3.4, 40]} />
        <meshStandardMaterial color="#2f6f8f" transparent opacity={0.82} roughness={0.1} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* muddy shore ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[3.4, 3.95, 40]} />
        <meshStandardMaterial color="#5a4a2f" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* lily pads + blooms */}
      {lilies.map((p, i) => (
        <group key={i} position={[p[0], 0.06, p[1]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshStandardMaterial color="#3d8a3a" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0.06, 0.04, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#f4f1ea" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// ── Hippo (low-poly) ───────────────────────────────────────────────────────────
interface AnimalProps {
  position: [number, number, number]
  rotation?: number
  scale?: number
}

function Hippo({ position, rotation = 0, scale = 1 }: AnimalProps) {
  const grey = '#8d8a92'
  const dark = '#6f6c74'
  const legs: [number, number][] = [[-0.7, -0.45], [0.7, -0.45], [-0.7, 0.45], [0.7, 0.45]]
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.2, 1.05, 1.15]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.62, 14, 12]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      {/* legs */}
      {legs.map((p, i) => (
        <mesh key={i} position={[p[0], 0.2, p[1]]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.4, 8]} />
          <meshStandardMaterial color={dark} roughness={0.9} />
        </mesh>
      ))}
      {/* head + snout */}
      <mesh position={[1.25, 0.6, 0]} castShadow>
        <boxGeometry args={[0.95, 0.78, 1.05]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      <mesh position={[1.78, 0.42, 0]} castShadow>
        <boxGeometry args={[0.55, 0.42, 0.95]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      {/* eyes */}
      {[[1.58, 0.86, 0.4], [1.58, 0.86, -0.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#15150f" />
        </mesh>
      ))}
      {/* ears */}
      {[[1.05, 1.05, 0.42, 0.4], [1.05, 1.05, -0.42, -0.4]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]}>
          <coneGeometry args={[0.1, 0.18, 6]} />
          <meshStandardMaterial color={dark} />
        </mesh>
      ))}
      {/* nostrils */}
      {[[2.05, 0.5, 0.18], [2.05, 0.5, -0.18]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#15150f" />
        </mesh>
      ))}
    </group>
  )
}

// ── Cow (low-poly) ─────────────────────────────────────────────────────────────
function Cow({ position, rotation = 0, scale = 1 }: AnimalProps) {
  const white = '#f3efe6'
  const black = '#1c1c1c'
  const pink = '#e6a9a0'
  const legs: [number, number][] = [[-0.7, -0.45], [0.7, -0.45], [-0.7, 0.45], [0.7, 0.45]]
  const patches: [number, number, number][] = [[0.4, 0.4, 0.4], [-0.3, -0.3, 0.3], [0.2, -0.2, -0.35], [-0.5, 0.1, -0.2]]
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.2, 1.1, 1.1]} />
        <meshStandardMaterial color={white} roughness={0.9} />
      </mesh>
      {/* patches (on top) */}
      {patches.map((p, i) => (
        <mesh key={i} position={[p[0], 1.31, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 12]} />
          <meshStandardMaterial color={black} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* legs + hooves */}
      {legs.map((p, i) => (
        <group key={i}>
          <mesh position={[p[0], 0.3, p[1]]} castShadow>
            <cylinderGeometry args={[0.13, 0.14, 0.6, 8]} />
            <meshStandardMaterial color={white} roughness={0.9} />
          </mesh>
          <mesh position={[p[0], 0.04, p[1]]}>
            <cylinderGeometry args={[0.14, 0.12, 0.12, 8]} />
            <meshStandardMaterial color={black} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* head + nose */}
      <mesh position={[1.32, 0.85, 0]} castShadow>
        <boxGeometry args={[0.6, 0.72, 0.7]} />
        <meshStandardMaterial color={white} roughness={0.9} />
      </mesh>
      <mesh position={[1.63, 0.68, 0]}>
        <boxGeometry args={[0.16, 0.24, 0.5]} />
        <meshStandardMaterial color={pink} roughness={0.8} />
      </mesh>
      {/* horns */}
      {[[1.36, 1.28, 0.18, -0.5], [1.36, 1.28, -0.18, 0.5]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]}>
          <coneGeometry args={[0.05, 0.2, 6]} />
          <meshStandardMaterial color="#e8e0c8" />
        </mesh>
      ))}
      {/* ears */}
      {[[1.12, 1.0, 0.4, 0.6], [1.12, 1.0, -0.4, -0.6]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color={white} />
        </mesh>
      ))}
      {/* eyes */}
      {[[1.6, 1.0, 0.22], [1.6, 1.0, -0.22]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#15150f" />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[-1.15, 0.9, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshStandardMaterial color={white} />
      </mesh>
      <mesh position={[-1.38, 0.62, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={black} />
      </mesh>
    </group>
  )
}