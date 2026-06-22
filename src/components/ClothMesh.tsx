import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useClothPhysics, COLS, ROWS, CLOTH_W, CLOTH_H } from '../hooks/useClothPhysics'
import type { Weather } from '../types'

interface ClothMeshProps {
  windStrength: number
  weather: Weather
  fanPosition: THREE.Vector3
  texture: THREE.Texture | null
  quality?: 'high' | 'low'
  /** Wind-tunnel mode — the garment floats in mid-air instead of hanging pinned. */
  suspended?: boolean
}

export function ClothMesh({ windStrength, weather, fanPosition, texture, quality = 'high', suspended = false }: ClothMeshProps) {
  const { camera } = useThree()
  const { positions, initCloth, update, applyImpulse } = useClothPhysics()

  const timeRef      = useRef(0)
  const mousePosRef  = useRef({ x: 0, y: 0, z: 0, valid: false })
  const isDownRef    = useRef(false)
  const cursorRef    = useRef<THREE.Group>(null)
  const cursorScale  = useRef(1)
  const ringMatRef   = useRef<THREE.MeshBasicMaterial>(null)

  // Build geometry once — same segment count as cloth particles
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(CLOTH_W, CLOTH_H, COLS - 1, ROWS - 1)
  }, [])

  // Dispose geometry on unmount
  useEffect(() => () => geometry.dispose(), [geometry])

  // Physics init
  useEffect(() => { initCloth() }, [initCloth])

  // Mouse → 3D cloth plane intersection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ndcX =  (e.clientX / window.innerWidth)  * 2 - 1
    const ndcY = -(e.clientY / window.innerHeight) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const hit   = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, hit)
    if (hit) {
      mousePosRef.current = { x: hit.x, y: hit.y, z: hit.z, valid: true }
    }
  }, [camera])

  useEffect(() => {
    const onDown  = () => { isDownRef.current = true  }
    const onUp    = () => { isDownRef.current = false }
    const onLeave = () => { mousePosRef.current.valid = false }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [handleMouseMove])

  // Material — true-colour fabric so the cutout garment reads naturally (no
  // house-dark tint, no rectangular box). Transparent + alphaTest renders only
  // the baked cutout silhouette. Weather modulates wet/sheen/roughness.
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    map:           null,
    color:         new THREE.Color('#ffffff'),
    metalness:     0.0,
    roughness:     0.82,
    sheen:         0.35,
    sheenRoughness:0.5,
    sheenColor:    new THREE.Color('#c9a44c'),
    side:          THREE.DoubleSide,
    transparent:   true,
    alphaTest:     0.18,
    envMapIntensity: 0.6,
  }), [])

  useEffect(() => () => material.dispose(), [material])

  // Weather → material look (tints multiply the garment photo; kept subtle so
  // the piece stays true-colour, just damp/sheened by the elements).
  useEffect(() => {
    switch (weather) {
      case 'rain':
        material.roughness = 0.45
        material.sheen = 0.7
        material.color.set('#d6d9dd')   // cool & damp
        break
      case 'snow':
        material.roughness = 0.7
        material.sheen = 0.4
        material.color.set('#eef0f2')
        break
      case 'hail':
        material.roughness = 0.5
        material.sheen = 0.5
        material.color.set('#dfe2e5')
        break
      case 'windy':
        material.roughness = 0.8
        material.sheen = 0.35
        material.color.set('#ffffff')
        break
      default: // sunny
        material.roughness = 0.82
        material.sheen = 0.35
        material.color.set('#ffffff')
    }
    material.needsUpdate = true
  }, [material, weather])

  // Swap in texture when ready. A new garment triggers a short ripple impulse
  // so the cloth visibly reacts to the change.
  const prevTextureRef = useRef<THREE.Texture | null>(null)
  useEffect(() => {
    if (texture) {
      material.map = texture
      material.needsUpdate = true
      if (prevTextureRef.current !== texture) {
        applyImpulse(0.16)   // visible "push" when toggling to a new garment
        prevTextureRef.current = texture
      }
    }
  }, [material, texture, applyImpulse])

  useFrame(() => {
    timeRef.current += 0.016
    const { x, y, z, valid } = mousePosRef.current

    update({
      windStrength,
      weather,
      fanX: fanPosition.x, fanY: fanPosition.y, fanZ: fanPosition.z,
      mouseX: x, mouseY: y, mouseZ: z,
      hasMousePos: valid,
      isMouseDown: isDownRef.current,
      time: timeRef.current,
      quality,
      suspended,
    })

    // Write cloth particle positions directly into geometry buffer
    const attr = geometry.attributes.position as THREE.BufferAttribute
    ;(attr.array as Float32Array).set(positions)
    attr.needsUpdate = true
    geometry.computeVertexNormals()

    // Interaction cursor — gold ring on the cloth that tracks the mouse and
    // grows on click; gives the physics poke a visible focal point.
    if (cursorRef.current) {
      cursorRef.current.visible = valid
      if (valid) {
        cursorRef.current.position.set(x, y, 0.02)
        const target = isDownRef.current ? 1.55 : 1.0
        cursorScale.current += (target - cursorScale.current) * 0.18
        cursorRef.current.scale.setScalar(Math.max(0.001, cursorScale.current))
      }
    }
    if (ringMatRef.current) {
      ringMatRef.current.opacity = 0.45 + 0.12 * Math.sin(timeRef.current * 3)
    }
  })

  return (
    <>
      {/* No shadow flags — a cast shadow would betray the rectangular cloth
          plane behind the cutout. The soft ContactShadows blob reads as the
          floating piece's ground contact instead. */}
      <mesh geometry={geometry} material={material} />

      {weather === 'snow' && quality !== 'low' && !suspended && <SnowAccumulation positions={positions} />}

      {/* Interaction cursor — drawn on top, ignores depth so it always reads */}
      <group ref={cursorRef} visible={false} renderOrder={999}>
        <mesh>
          < ringGeometry args={[0.1, 0.13, 40]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color="#c9a44c"
            transparent
            opacity={0.5}
            depthTest={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <circleGeometry args={[0.014, 24]} />
          <meshBasicMaterial color="#c9a44c" transparent opacity={0.7} depthTest={false} />
        </mesh>
      </group>
    </>
  )
}

// ── Light snow accumulation on the pinned top edge of the cloth ──────────────
function SnowAccumulation({ positions }: { positions: Float32Array }) {
  const count = 8
  const refs = useRef<THREE.Mesh[]>([])

  useFrame(() => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      // Sample evenly across the top row of particles
      const col = Math.floor((i / (count - 1)) * (COLS - 1))
      const pi = col * 3
      mesh.position.set(positions[pi], positions[pi + 1] - 0.04, positions[pi + 2] + 0.02)
      mesh.visible = positions[pi + 1] > -1.5
    })
  })

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={el => { if (el) refs.current[i] = el }}
          visible={false}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#e8edf2" transparent opacity={0.75} depthTest={false} />
        </mesh>
      ))}
    </>
  )
}
