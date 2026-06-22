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
import { useFrame } from '@react-three/fiber'
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
  quality?: 'high' | 'low'
}

export function Nature({ weather, dayNight, quality = 'high' }: NatureProps) {
  const grass = grassTone(weather, dayNight)
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color={grass} roughness={1} />
      </mesh>

      <GrassField base={grass} swayWeather={weather} quality={quality} />
      <Daisies quality={quality} />
      <Flowers quality={quality} />
      <Trees />
      <Bushes />
      <Rocks />
      <Pond position={[-7, GROUND_Y, -3.5]} />
      <Cattails center={[-7, -3.5]} />
      {quality !== 'low' && <Butterflies />}
      <Hippo position={[-5.2, GROUND_Y, -2.4]} rotation={-0.3} />
      <Hippo position={[-8.4, GROUND_Y, -5.2]} rotation={0.7} scale={0.82} />
      <Cow position={[6.5, GROUND_Y, -2.5]} rotation={-0.5} />
      <Cow position={[8.8, GROUND_Y, 1.6]} rotation={0.4} scale={0.9} />
    </group>
  )
}

// ── Grass blades (instanced for density) ──────────────────────────────────────
function GrassField({ base, swayWeather, quality }: { base: string; swayWeather: Weather; quality?: 'high' | 'low' }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const COUNT = quality === 'low' ? 200 : 700
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const timeRef = useRef(0)
  const blades = useMemo(() => Array.from({ length: COUNT }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(2.5, 28)
    return {
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      rot: Math.random() * Math.PI,
      s: rand(0.5, 1.4),
      phase: Math.random() * Math.PI * 2,
    }
  }), [COUNT])

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

  useFrame((_, delta) => {
    if (!ref.current) return
    if (swayWeather !== 'windy' && swayWeather !== 'rain' && swayWeather !== 'hail') return
    timeRef.current += Math.min(delta, 0.05)
    const t = timeRef.current
    const intensity = swayWeather === 'hail' ? 0.15 : swayWeather === 'rain' ? 0.08 : 0.12
    blades.forEach((b, i) => {
      dummy.position.set(b.x, GROUND_Y + b.s * 0.25, b.z)
      dummy.rotation.set(
        Math.sin(t * 1.2 + b.phase) * intensity,
        b.rot + Math.sin(t * 0.5 + b.phase) * intensity * 0.3,
        Math.cos(t * 0.9 + b.phase) * intensity * 0.5
      )
      dummy.scale.set(b.s, b.s, b.s)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <coneGeometry args={[0.035, 0.5, 4]} />
      <meshStandardMaterial color={base} roughness={0.95} />
    </instancedMesh>
  )
}

// ── Daisies ────────────────────────────────────────────────────────────────────
const DAISY_COLORS = ['#ffffff', '#f4f1ea', '#f0ead6']

function Daisies({ quality }: { quality?: 'high' | 'low' }) {
  const items = useMemo(() => Array.from({ length: quality === 'low' ? 18 : 55 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(3, 24)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.7, 1.2), c: pick(DAISY_COLORS) }
  }), [quality])
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

function Flowers({ quality }: { quality?: 'high' | 'low' }) {
  const items = useMemo(() => Array.from({ length: quality === 'low' ? 14 : 42 }, () => {
    const a = Math.random() * Math.PI * 2
    const r = rand(3.5, 25)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(0.7, 1.3), c: pick(FLOWER_COLORS) }
  }), [quality])
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

// ── Cattails / reeds at the pond edge ──────────────────────────────────────────
function Cattails({ center }: { center: [number, number] }) {
  const items = useMemo(() => {
    const arr: { x: number; z: number; h: number; tilt: number }[] = []
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand(-0.2, 0.2)
      const r = rand(3.7, 4.4)
      arr.push({ x: center[0] + Math.cos(a) * r, z: center[1] + Math.sin(a) * r, h: rand(1.0, 1.5), tilt: rand(-0.12, 0.12) })
    }
    return arr
  }, [center])
  return (
    <>
      {items.map((c, i) => (
        <group key={i} position={[c.x, GROUND_Y, c.z]} rotation={[0, 0, c.tilt]}>
          {/* green stem */}
          <mesh position={[0, c.h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, c.h, 6]} />
            <meshStandardMaterial color="#3d6b2f" roughness={1} />
          </mesh>
          {/* brown cattail head */}
          <mesh position={[0, c.h + 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.34, 8]} />
            <meshStandardMaterial color="#5a3a1a" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Butterflies (animated, drifting over the meadow) ──────────────────────────
const WING_COLORS = ['#d96a8e', '#e8c14e', '#5e9ad9', '#e08a3c', '#b48ad9']

function Butterflies() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])
  const wingLRefs = useRef<(THREE.Mesh | null)[]>([])
  const wingRRefs = useRef<(THREE.Mesh | null)[]>([])
  const timeRef = useRef(0)
  const COUNT = 6
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    cx: rand(-9, 9),
    cz: rand(-9, 9),
    cy: rand(0.9, 1.9),
    ax: rand(2.2, 4.0),     // lissajous radii
    az: rand(2.2, 4.0),
    speed: rand(0.25, 0.5),
    phase: rand(0, Math.PI * 2),
    flap: rand(9, 13),
    color: WING_COLORS[i % WING_COLORS.length],
  })), [])

  useFrame((_, delta) => {
    timeRef.current += Math.min(delta, 0.05)
    const t = timeRef.current
    data.forEach((d, i) => {
      const g = groupRefs.current[i]
      if (g) {
        g.position.set(
          d.cx + Math.sin(t * d.speed + d.phase) * d.ax,
          d.cy + Math.sin(t * d.speed * 1.7 + d.phase) * 0.4,
          d.cz + Math.cos(t * d.speed * 0.8 + d.phase) * d.az,
        )
        g.rotation.y = Math.atan2(Math.cos(t * d.speed + d.phase), -Math.sin(t * d.speed * 0.8 + d.phase))
      }
      const flap = Math.sin(t * d.flap) * 0.7
      if (wingLRefs.current[i]) wingLRefs.current[i]!.rotation.y = flap
      if (wingRRefs.current[i]) wingRRefs.current[i]!.rotation.y = -flap
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <group key={i} ref={el => { groupRefs.current[i] = el }}>
          {/* body */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.12, 6]} />
            <meshStandardMaterial color="#15150f" />
          </mesh>
          {/* left wing */}
          <mesh ref={el => { wingLRefs.current[i] = el }} position={[0.07, 0.02, 0]} rotation={[0, 0, 0.2]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={d.color} side={THREE.DoubleSide} transparent opacity={0.92} />
          </mesh>
          {/* right wing */}
          <mesh ref={el => { wingRRefs.current[i] = el }} position={[-0.07, 0.02, 0]} rotation={[0, 0, -0.2]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={d.color} side={THREE.DoubleSide} transparent opacity={0.92} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Hippo (low-poly, proportionally corrected) ─────────────────────────────────
// Barrel body (length ≈ 2.4× height), very short stubby pillar legs, an
// ENORMOUS wide blunt head (~⅓ of the body), eyes/ears/nostrils high on top
// of the skull (semiaquatic periscope placement), purplish-grey with a pinkish
// underside, short tail. Per San Diego Zoo / Wikipedia hippo anatomy.
interface AnimalProps {
  position: [number, number, number]
  rotation?: number
  scale?: number
}

function Hippo({ position, rotation = 0, scale = 1 }: AnimalProps) {
  const skin  = '#938a93'   // purplish grey
  const dark  = '#6b636c'   // legs / lower jaw
  const belly = '#c9a0a6'   // pinkish underside
  const legs: [number, number][] = [[-0.75, -0.42], [0.75, -0.42], [-0.75, 0.42], [0.75, 0.42]]
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Barrel body — capsule laid along X */}
      <mesh position={[0, 0.64, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.56, 1.7, 8, 16]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* Pinkish belly */}
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.4, 1.3, 6, 12]} />
        <meshStandardMaterial color={belly} roughness={0.95} />
      </mesh>
      {/* Enormous wide head — rounded dome */}
      <mesh position={[1.2, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.64, 16, 14]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* Wide blunt snout */}
      <mesh position={[1.62, 0.52, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 1.22]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* Lower jaw / mouth line */}
      <mesh position={[1.55, 0.35, 0]}>
        <boxGeometry args={[0.55, 0.16, 1.12]} />
        <meshStandardMaterial color={dark} roughness={0.95} />
      </mesh>
      {/* Legs — short stubby pillars */}
      {legs.map((p, i) => (
        <mesh key={i} position={[p[0], 0.22, p[1]]} castShadow>
          <cylinderGeometry args={[0.19, 0.21, 0.44, 10]} />
          <meshStandardMaterial color={dark} roughness={0.95} />
        </mesh>
      ))}
      {/* Eyes — bulging, high on top of the head (periscope) */}
      {[[1.04, 1.02, 0.3], [1.04, 1.02, -0.3]].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh><sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color={skin} /></mesh>
          <mesh position={[0.06, 0.02, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#15150f" /></mesh>
        </group>
      ))}
      {/* Ears — small, atop the head behind the eyes */}
      {[[0.6, 1.08, 0.4, 0.5], [0.6, 1.08, -0.4, -0.5]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]}>
          <coneGeometry args={[0.11, 0.16, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ))}
      {/* Nostrils — on top of the snout */}
      {[[1.9, 0.72, 0.18], [1.9, 0.72, -0.18]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.05, 8]} />
          <meshStandardMaterial color="#15150f" />
        </mesh>
      ))}
      {/* Short tail */}
      <mesh position={[-1.42, 0.62, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.04, 0.03, 0.34, 6]} />
        <meshStandardMaterial color={skin} />
      </mesh>
    </group>
  )
}

// ── Cow (low-poly, proportionally corrected — Holstein-type) ──────────────────
// Rectangular barrel body, longer legs than the hippo, a NECK connecting body
// to a forward head, an UDDER with four teats under the belly, CLOVEN hooves,
// curved horns, large lateral ears, a dewlap, and a long tail with a switch.
// White with black side patches. Per Budras bovine anatomy / ICAR conformation.
function Cow({ position, rotation = 0, scale = 1 }: AnimalProps) {
  const white = '#f2eee4'
  const black = '#1a1a1a'
  const pink = '#e3a39a'
  const hoof = '#2a2520'
  const horn = '#e8e0c8'
  const legs: [number, number][] = [[-0.72, -0.4], [0.72, -0.4], [-0.72, 0.4], [0.72, 0.4]]
  // Black patches — flattened ellipsoids on the body sides + top + rump.
  const patches: { p: [number, number, number]; s: [number, number, number] }[] = [
    { p: [0.45, 1.36, 0.1],  s: [0.34, 0.08, 0.3] },
    { p: [0.1, 0.95, 0.5],   s: [0.32, 0.24, 0.06] },
    { p: [-0.3, 1.0, -0.5],  s: [0.3, 0.22, 0.06] },
    { p: [-0.95, 1.32, 0],   s: [0.26, 0.08, 0.28] },
    { p: [0.7, 1.12, 0.42],  s: [0.2, 0.16, 0.06] },
    { p: [-0.5, 0.7, -0.46], s: [0.22, 0.18, 0.06] },
  ]
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Body — rectangular barrel (capsule along X) */}
      <mesh position={[0, 0.86, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.52, 1.5, 8, 16]} />
        <meshStandardMaterial color={white} roughness={0.95} />
      </mesh>
      {/* Patches */}
      {patches.map((pt, i) => (
        <mesh key={i} position={pt.p} scale={pt.s}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={black} roughness={0.95} />
        </mesh>
      ))}
      {/* Neck — forward-down from body to head */}
      <mesh position={[1.08, 0.74, 0]} rotation={[0, 0, -0.55]} castShadow>
        <capsuleGeometry args={[0.27, 0.45, 6, 12]} />
        <meshStandardMaterial color={white} roughness={0.95} />
      </mesh>
      {/* Dewlap under the neck */}
      <mesh position={[0.98, 0.46, 0]}>
        <boxGeometry args={[0.48, 0.16, 0.4]} />
        <meshStandardMaterial color={white} roughness={0.95} />
      </mesh>
      {/* Head */}
      <mesh position={[1.62, 0.92, 0]} castShadow>
        <boxGeometry args={[0.56, 0.62, 0.5]} />
        <meshStandardMaterial color={white} roughness={0.95} />
      </mesh>
      {/* Muzzle / pink nose */}
      <mesh position={[1.92, 0.8, 0]}>
        <boxGeometry args={[0.22, 0.34, 0.46]} />
        <meshStandardMaterial color={pink} roughness={0.85} />
      </mesh>
      {/* Eyes — sides of head */}
      {[[1.72, 1.04, 0.26], [1.72, 1.04, -0.26]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#15150f" />
        </mesh>
      ))}
      {/* Horns — curved up & slightly out */}
      {[[1.52, 1.26, 0.16, -0.35], [1.52, 1.26, -0.16, 0.35]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, 0, p[3]]}>
          <coneGeometry args={[0.05, 0.22, 6]} />
          <meshStandardMaterial color={horn} />
        </mesh>
      ))}
      {/* Ears — large, pointing laterally (out to the sides) */}
      {[[1.5, 0.98, 0.4, Math.PI / 2, -0.2], [1.5, 0.98, -0.4, -Math.PI / 2, -0.2]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[p[3], 0, p[4]]}>
          <coneGeometry args={[0.08, 0.26, 6]} />
          <meshStandardMaterial color={white} roughness={0.95} />
        </mesh>
      ))}
      {/* Legs + cloven hooves (two dark toes each) */}
      {legs.map((p, i) => (
        <group key={i}>
          <mesh position={[p[0], 0.45, p[1]]} castShadow>
            <cylinderGeometry args={[0.11, 0.12, 0.7, 8]} />
            <meshStandardMaterial color={white} roughness={0.95} />
          </mesh>
          <mesh position={[p[0], 0.07, p[1] + 0.06]}>
            <boxGeometry args={[0.15, 0.1, 0.07]} />
            <meshStandardMaterial color={hoof} roughness={0.9} />
          </mesh>
          <mesh position={[p[0], 0.07, p[1] - 0.06]}>
            <boxGeometry args={[0.15, 0.1, 0.07]} />
            <meshStandardMaterial color={hoof} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Udder — pink, under the rear belly, with four teats */}
      <group position={[-0.25, 0.42, 0]}>
        <mesh>
          <sphereGeometry args={[0.26, 12, 10]} />
          <meshStandardMaterial color={pink} roughness={0.8} />
        </mesh>
        {[[0.12, -0.18, 0.12], [-0.12, -0.18, 0.12], [0.12, -0.18, -0.12], [-0.12, -0.18, -0.12]].map((t, i) => (
          <mesh key={i} position={[t[0], t[1], t[2]]}>
            <cylinderGeometry args={[0.04, 0.035, 0.13, 6]} />
            <meshStandardMaterial color={pink} roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Tail — long, dropping back, with a dark switch */}
      <mesh position={[-1.2, 0.95, 0]} rotation={[0, 0, -2.4]}>
        <cylinderGeometry args={[0.035, 0.03, 0.8, 6]} />
        <meshStandardMaterial color={white} />
      </mesh>
      <mesh position={[-1.45, 0.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={black} roughness={0.95} />
      </mesh>
    </group>
  )
}