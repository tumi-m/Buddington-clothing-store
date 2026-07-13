// FILE: src/components/FlightRig.tsx
// Continuous scroll-driven camera flight through the EXPERIENCE scene
// (scroll-world "Architecture A": one forward take, no cuts, never reversing
// direction across a chapter seam). The path descends from inside the sky
// dome, banks down past the horizon, skims the nature ground, drifts by the
// fan and settles EXACTLY on the default framing (0, 0.2, 6 → origin, fov 42)
// so OrbitControls takes over with a frame-identical seam — the skill's #1
// rule for invisible handoffs.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'

interface FlightRigProps {
  /** Damped flight progress 0→1 (mutated per frame by useScrollFlight). */
  progress: MutableRefObject<number>
  /** While true the rig owns the camera; when it flips false the rig writes the
   *  exact resting pose once and goes quiet. */
  enabled: boolean
}

export const FLIGHT_CHAPTERS = 5
const LINGER = 0.3          // scrub-engine lingerEase weight — dwell mid-chapter
const REST_FOV = 42          // must match the Canvas camera fov in App.tsx
const WIDE_FOV = 55          // opening fov — eases down to REST_FOV as we land

// lingerEase from the scrub engine: remaps [0,1] so the camera settles
// mid-chapter. Monotonic for L < 1, so the take never reverses.
function lingerEase(x: number, l: number): number {
  const c = x - 0.5
  return (1 - l) * x + l * (4 * c * c * c + 0.5)
}

// Apply lingerEase within each chapter while keeping global progress monotonic.
function chapterEase(p: number): number {
  const clamped = Math.min(1, Math.max(0, p))
  const scaled = clamped * FLIGHT_CHAPTERS
  const i = Math.min(FLIGHT_CHAPTERS - 1, Math.floor(scaled))
  return (i + lingerEase(scaled - i, LINGER)) / FLIGHT_CHAPTERS
}

export function FlightRig({ progress, enabled }: FlightRigProps) {
  const wasEnabled = useRef(false)

  // Six keyframes → five chapters (I sky · II descent · III ground ·
  // IV the current · V the garment). Ground plane sits at y = -2.2; the sky
  // dome radius is 60; the fan is at (2.8, 0, 0.4).
  const positionPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 30, -34),    // I    — high inside the sky dome
          new THREE.Vector3(-14, 16, -16),  // II   — banking descent, left flank
          new THREE.Vector3(-11, 2.2, 7),   // III  — swings around to front-left
          new THREE.Vector3(-4.5, -1.1, 9), // III→IV — low pass over the flora
          new THREE.Vector3(3.5, 0.1, 6.5), // IV   — drifting by the fan's airflow
          new THREE.Vector3(0, 0.2, 6),     // V    — resting frame (OrbitControls default)
        ],
        false,
        'centripetal',
      ),
    [],
  )

  const targetPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 8, 0),      // horizon over the garment
          new THREE.Vector3(0, 3.5, 0),
          new THREE.Vector3(0, 0.5, 0),
          new THREE.Vector3(0.5, -0.8, 0), // grazing the garment's hem / ground
          new THREE.Vector3(1.8, 0, 0.4),  // a glance toward the fan
          new THREE.Vector3(0, 0, 0),      // resting target (OrbitControls default)
        ],
        false,
        'centripetal',
      ),
    [],
  )

  const camPos = useRef(new THREE.Vector3())
  const camTarget = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    if (!enabled) {
      // One final write on the frame after handoff so the seam is exact even
      // if the last damped frame undershot.
      if (wasEnabled.current) {
        wasEnabled.current = false
        applyPose(camera, positionPath, targetPath, 1)
      }
      return
    }
    wasEnabled.current = true
    applyPose(camera, positionPath, targetPath, chapterEase(progress.current))
  })

  function applyPose(
    camera: THREE.Camera,
    pos: THREE.CatmullRomCurve3,
    tgt: THREE.CatmullRomCurve3,
    t: number,
  ) {
    pos.getPoint(t, camPos.current)
    tgt.getPoint(t, camTarget.current)
    camera.position.copy(camPos.current)
    camera.lookAt(camTarget.current)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = REST_FOV + (WIDE_FOV - REST_FOV) * (1 - t)
      camera.updateProjectionMatrix()
    }
  }

  return null
}
