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
    const onDown = () => { isDownRef.current = true  }
    const onUp   = () => { isDownRef.current = false }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [handleMouseMove])

  // Material
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    map:           null,
    color:         new THREE.Color('#111827'),
    metalness:     0.25,
    roughness:     0.18,
    sheen:         1.0,
    sheenRoughness:0.25,
    sheenColor:    new THREE.Color('#c9a96e'),
    side:          THREE.DoubleSide,
    envMapIntensity: 1.2,
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
  })

  return <mesh geometry={geometry} material={material} receiveShadow castShadow />
}
