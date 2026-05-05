import { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE_TYPES from 'three'
import * as THREE from 'three'
import { ClothMesh } from './ClothMesh'
import { Fan } from './Fan'
import { useSlideshowTexture } from '../hooks/useSlideshowTexture'

interface SceneProps {
  windStrength: number
}

const FAN_POSITION = new THREE.Vector3(2.8, 0, 0.4)

export function Scene({ windStrength }: SceneProps) {
  const { gl } = useThree()
  const texture = useSlideshowTexture()

  // Shadow-map quality
  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type    = THREE.PCFSoftShadowMap
    gl.toneMapping       = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.1
  }, [gl])

  return (
    <>
      {/* ── Lights ──────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.25} />

      {/* Key light — slightly warm */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Rim light — gold from below-right */}
      <directionalLight
        position={[3, -2, 3]}
        intensity={0.7}
        color="#c9a96e"
      />

      {/* Fill light — cool blue from left */}
      <directionalLight
        position={[-5, 2, 1]}
        intensity={0.4}
        color="#8ab4d4"
      />

      {/* ── Cloth ───────────────────────────────────────────────────────── */}
      <ClothMesh
        windStrength={windStrength}
        fanPosition={FAN_POSITION}
        texture={texture}
      />

      {/* ── Fan ─────────────────────────────────────────────────────────── */}
      <Fan position={FAN_POSITION} windStrength={windStrength} />

      {/* ── Ground shadow ───────────────────────────────────────────────── */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.45}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* ── Subtle ground plane ─────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* ── Environment (HDRI-style) ─────────────────────────────────────── */}
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
          luminanceThreshold={0.28}
          luminanceSmoothing={0.85}
          intensity={0.55}
          blendFunction={BlendFunction.ADD}
        />
        <ChromaticAberration
          offset={new THREE_TYPES.Vector2(0.0004, 0.0004)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette offset={0.38} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
