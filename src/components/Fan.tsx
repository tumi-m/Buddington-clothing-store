import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FanProps {
  position: THREE.Vector3
  windStrength: number
}

// ── Blade ─────────────────────────────────────────────────────────────────────
function Blade({ index, total }: { index: number; total: number }) {
  const baseAngle = (index / total) * Math.PI * 2
  const bladeGeo  = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.05, 0.12, 0.18, 0.22, 0.1, 0.38)
    shape.bezierCurveTo(0.06, 0.44, -0.06, 0.44, -0.1, 0.38)
    shape.bezierCurveTo(-0.18, 0.22, -0.05, 0.12, 0, 0)
    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <mesh
      geometry={bladeGeo}
      rotation={[0, 0, baseAngle]}
      position={[0, 0, 0.04]}
    >
      <meshPhysicalMaterial
        color="#d8d8d8"
        metalness={0.4}
        roughness={0.3}
        side={THREE.DoubleSide}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

// ── Airflow particles ──────────────────────────────────────────────────────────
function AirflowParticles({ active }: { active: boolean }) {
  const ref     = useRef<THREE.Points>(null)
  const COUNT   = 80

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      // start scattered in a disk in front of fan
      pos[i*3]   = (Math.random() - 0.5) * 0.5    // spread in Y
      pos[i*3+1] = (Math.random() - 0.5) * 0.5    // spread in Z
      pos[i*3+2] = Math.random() * -0.3            // initially close to fan face
      vel[i*3]   = -(0.02 + Math.random() * 0.04)  // move in -X (toward cloth)
      vel[i*3+1] = (Math.random() - 0.5) * 0.005
      vel[i*3+2] = (Math.random() - 0.5) * 0.005
    }
    return { positions: pos, velocities: vel }
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame(() => {
    if (!ref.current || !active) return
    const pos = geo.attributes.position as THREE.BufferAttribute
    const arr  = pos.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      arr[i*3]   += velocities[i*3]
      arr[i*3+1] += velocities[i*3+1]
      arr[i*3+2] += velocities[i*3+2]
      // reset particles that travel past cloth (~-3 units away)
      if (arr[i*3] < -3.2) {
        arr[i*3]   = (Math.random() - 0.5) * 0.5
        arr[i*3+1] = (Math.random() - 0.5) * 0.5
        arr[i*3+2] = 0
      }
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#aad4ff"
        size={0.018}
        transparent
        opacity={active ? 0.45 : 0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ── Fan assembly ───────────────────────────────────────────────────────────────
export function Fan({ position, windStrength }: FanProps) {
  const bladesRef = useRef<THREE.Group>(null)
  const BLADES    = 4
  const isActive  = windStrength > 0.05

  useFrame((_, delta) => {
    if (!bladesRef.current) return
    // blade RPM scales with wind strength
    const rpm = windStrength * 12
    bladesRef.current.rotation.x += delta * rpm
  })

  return (
    <group position={position}>
      {/* ── Base ────────────────────────────────────────────────────── */}
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* ── Stand ─────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 1.26, 12]} />
        <meshStandardMaterial color="#d5d5d5" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* ── Neck / tilt joint ─────────────────────────────────────────── */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* ── Motor housing ─────────────────────────────────────────────── */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.36, 32]} />
        <meshPhysicalMaterial color="#eeeeee" metalness={0.35} roughness={0.3} />
      </mesh>

      {/* ── Blade hub cap ──────────────────────────────────────────────── */}
      <mesh position={[-0.19, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 20]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* ── Spinning blades ─────────────────────────────────────────────── */}
      <group ref={bladesRef} position={[-0.22, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {Array.from({ length: BLADES }, (_, i) => (
          <Blade key={i} index={i} total={BLADES} />
        ))}
      </group>

      {/* ── Guard ring ──────────────────────────────────────────────────── */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.36, 0.018, 8, 64]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Inner guard ring */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 48]} />
        <meshStandardMaterial color="#cccccc" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Guard cross-bars (vertical) */}
      {[-0.18, -0.06, 0.06, 0.18].map((offset, i) => (
        <mesh key={i} position={[-0.25, offset, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.72, 0.012, 0.012]} />
          <meshStandardMaterial color="#cccccc" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}

      {/* ── Airflow particles ───────────────────────────────────────────── */}
      <group position={[-0.3, 0, 0]}>
        <AirflowParticles active={isActive} />
      </group>

      {/* ── Emission glow when active ────────────────────────────────────── */}
      {isActive && (
        <mesh position={[-0.24, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.34, 32]} />
          <meshBasicMaterial
            color="#aad4ff"
            transparent
            opacity={0.04 + windStrength * 0.06}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
