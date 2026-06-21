// FILE: src/components/SkyDome.tsx
// A large gradient sphere acting as the sky. Colors driven by weather + day/night.
// Horizon colour at the ground plane, fading to the top colour overhead.

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export interface SkyDomeProps {
  top: string
  horizon: string
}

export function SkyDome({ top, horizon }: SkyDomeProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop:     { value: new THREE.Color(top) },
        uHorizon: { value: new THREE.Color(horizon) },
        uR:       { value: 60 },
      },
      vertexShader: /* glsl */`
        varying float vY;
        void main() {
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        varying float vY;
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform float uR;
        void main() {
          float t = clamp(vY / uR, 0.0, 1.0);
          gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
        }
      `,
    })
  }, [])

  useEffect(() => {
    material.uniforms.uTop.value.set(top)
    material.uniforms.uHorizon.value.set(horizon)
  }, [top, horizon, material])

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh material={material} frustumCulled={false}>
      <sphereGeometry args={[60, 32, 16]} />
    </mesh>
  )
}