import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useClothPhysics, COLS, ROWS, CLOTH_W, CLOTH_H } from '../hooks/useClothPhysics'

interface ClothMeshProps {
  windStrength: number
  fanPosition: THREE.Vector3
  texture: THREE.Texture | null
}

export function ClothMesh({ windStrength, fanPosition, texture }: ClothMeshProps) {
  const { camera } = useThree()
  const { positions, initCloth, update } = useClothPhysics()

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

  // Material
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    map:           null,
    color:         new THREE.Color('#1a1a1a'),   // neutral dark — slideshow photos read truer
    metalness:     0.25,
    roughness:     0.2,
    sheen:         1.0,
    sheenRoughness:0.25,
    sheenColor:    new THREE.Color('#c9a44c'),    // house gold
    side:          THREE.DoubleSide,
    envMapIntensity: 1.0,
  }), [])

  useEffect(() => () => material.dispose(), [material])

  // Swap in texture when ready
  useEffect(() => {
    if (texture) {
      material.map = texture
      material.needsUpdate = true
    }
  }, [material, texture])

  useFrame(() => {
    timeRef.current += 0.016
    const { x, y, z, valid } = mousePosRef.current

    update({
      windStrength,
      fanX: fanPosition.x, fanY: fanPosition.y, fanZ: fanPosition.z,
      mouseX: x, mouseY: y, mouseZ: z,
      hasMousePos: valid,
      isMouseDown: isDownRef.current,
      time: timeRef.current,
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
      <mesh geometry={geometry} material={material} receiveShadow castShadow />

      {/* Interaction cursor — drawn on top, ignores depth so it always reads */}
      <group ref={cursorRef} visible={false} renderOrder={999}>
        <mesh>
          <ringGeometry args={[0.1, 0.13, 40]} />
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
