import { useRef, useCallback } from 'react'
import type { Weather } from '../types'

// Cloth grid dimensions — 30×20 gives 600 particles (good perf/quality balance)
export const COLS = 30
export const ROWS = 20
export const CLOTH_W = 4.0  // world-space width
export const CLOTH_H = 3.0  // world-space height
const N = COLS * ROWS

const GRAVITY     = -0.006    // a touch heavier so the cloth hangs with real sag
const DAMPING     = 0.984    // air resistance — settles rather than sways forever
const ITERATIONS  = 16       // more constraint passes → stiffer, less stretchy fabric

// ── Wind-tunnel / suspended mode ────────────────────────────────────────────
// When `suspended` is true the garment is no longer pinned at the top edge —
// instead every particle is softly tethered to a slowly bobbing / yawing rest
// pose and gravity is nearly cancelled, so the piece levitates in mid-air and
// billows in the fan's airflow (a wind-tunnel effect) rather than hanging.
const SUSPEND_SPRING = 0.034   // soft tether to the floating rest pose
const SUSPEND_GRAV   = 0.35    // fraction of gravity that still applies (slight droop)
const SUSPEND_WIND_X = 0.10    // steady down-wind push is muted so it stays centred
const SUSPEND_FLUTTER = 2.6    // …but the oscillatory billow is exaggerated

export interface ClothPhysicsHandle {
  positions: Float32Array
  initCloth: () => void
  update: (params: UpdateParams) => void
  applyImpulse: (strength: number, centerX?: number, centerY?: number) => void
}

export interface UpdateParams {
  windStrength: number
  weather: Weather
  fanX: number
  fanY: number
  fanZ: number
  mouseX: number
  mouseY: number
  mouseZ: number
  hasMousePos: boolean
  isMouseDown: boolean
  time: number
  /** Low quality reduces iterations and skips expensive weather effects. */
  quality?: 'high' | 'low'
  /** Wind-tunnel mode — garment floats in mid-air instead of hanging pinned. */
  suspended?: boolean
}

export function useClothPhysics(): ClothPhysicsHandle {
  // Flat typed arrays — avoids per-frame GC pressure
  const pos  = useRef(new Float32Array(N * 3))
  const prev = useRef(new Float32Array(N * 3))
  const acc  = useRef(new Float32Array(N * 3))
  const pin  = useRef(new Uint8Array(N))
  const rest = useRef(new Float32Array(N * 3))   // floating rest pose (suspended mode)
  const suspendedRef = useRef(false)

  // Constraint arrays
  const cP1  = useRef(new Int32Array(0))
  const cP2  = useRef(new Int32Array(0))
  const cLen = useRef(new Float32Array(0))
  const cNum = useRef(0)
  const ready = useRef(false)

  const initCloth = useCallback(() => {
    const p   = pos.current
    const pp  = prev.current
    const pn  = pin.current
    const rp  = rest.current

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i  = row * COLS + col
        const x  = (col / (COLS - 1) - 0.5) * CLOTH_W
        const y  = (0.5 - row / (ROWS - 1)) * CLOTH_H
        const z  = 0
        p[i*3]     = x;  p[i*3+1]   = y;  p[i*3+2]   = z
        pp[i*3]    = x;  pp[i*3+1]  = y;  pp[i*3+2]  = z
        rp[i*3]    = x;  rp[i*3+1]  = y;  rp[i*3+2]  = z   // rest pose = the flat grid
        pn[i] = row === 0 ? 1 : 0   // pin entire top row (legacy hanging mode only)
      }
    }

    // Build constraint list
    const list: [number, number, number][] = []

    const addC = (a: number, b: number) => {
      const dx = p[a*3]   - p[b*3]
      const dy = p[a*3+1] - p[b*3+1]
      const dz = p[a*3+2] - p[b*3+2]
      list.push([a, b, Math.sqrt(dx*dx + dy*dy + dz*dz)])
    }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col
        if (col < COLS-1)              addC(i, i+1)            // structural H
        if (row < ROWS-1)              addC(i, i+COLS)         // structural V
        if (col < COLS-1 && row < ROWS-1) {
          addC(i, i+COLS+1)                                     // shear ↘
          addC(i+1, i+COLS)                                     // shear ↙
        }
        if (col < COLS-2)              addC(i, i+2)            // bend H
        if (row < ROWS-2)              addC(i, i+COLS*2)       // bend V
      }
    }

    const nc = list.length
    cP1.current  = new Int32Array(nc)
    cP2.current  = new Int32Array(nc)
    cLen.current = new Float32Array(nc)
    for (let j = 0; j < nc; j++) {
      cP1.current[j]  = list[j][0]
      cP2.current[j]  = list[j][1]
      cLen.current[j] = list[j][2]
    }
    cNum.current = nc
    ready.current = true
  }, [])

  // Precalculated squared distance impulse distribution. Honours the suspended
  // flag — in wind-tunnel mode there is no pinned edge, every particle reacts.
  const applyImpulse = useCallback((strength: number, centerX = 0, centerY = 0) => {
    const p = pos.current
    const pn = pin.current
    const a = acc.current
    const suspended = suspendedRef.current
    for (let i = 0; i < N; i++) {
      if (!suspended && pn[i]) continue
      const ix = i * 3
      const dx = p[ix] - centerX
      const dy = p[ix + 1] - centerY
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
      const falloff = Math.max(0, 1 - dist / 2.2)
      const force = strength * falloff
      a[ix] += (dx / dist) * force * 0.35
      a[ix + 1] += (dy / dist) * force * 0.35 + force * 0.25
      a[ix + 2] += (Math.random() - 0.5) * force * 0.15
    }
  }, [])

  const update = useCallback((params: UpdateParams) => {
    if (!ready.current) return

    const { windStrength, weather, fanX, fanY, fanZ,
            mouseX, mouseY, mouseZ, hasMousePos, isMouseDown, time, quality,
            suspended = false } = params

    suspendedRef.current = suspended
    const highQuality = quality !== 'low'

    const p   = pos.current
    const pp  = prev.current
    const a   = acc.current
    const pn  = pin.current
    const rp  = rest.current
    const p1a = cP1.current
    const p2a = cP2.current
    const la  = cLen.current
    const nc  = cNum.current

    // ── Weather → cloth behaviour ─────────────────────────────────────────────
    // WINDY adds an ambient breeze even with the fan off; RAIN/HAIL/SNOW make the
    // fabric wet & heavy (extra downward sag + more drag, so it flutters less and
    // recovers slowly). SUNNY is the baseline.
    const ambientWind = weather === 'windy' ? 0.30 : 0
    const wetDrag     = weather === 'rain' ? 0.965
                      : weather === 'hail' ? 0.960
                      : weather === 'snow' ? 0.974
                      : 1
    const extraSag     = weather === 'rain' ? 0.45
                      : weather === 'hail' ? 0.35
                      : weather === 'snow' ? 0.25
                      : 0
    const damp = DAMPING * wetDrag

    // ── Suspended (wind-tunnel) tether targets ────────────────────────────────
    // The whole rest pose yaws and bobs slowly, so the garment hangs in space
    // and turns lazily in the airflow. Computed once per frame, applied per
    // particle below.
    const sway = suspended ? Math.sin(time * 0.24) * 0.20 : 0   // gentle yaw (rad)
    const cosS = Math.cos(sway)
    const sinS = Math.sin(sway)
    const bobX = suspended ? Math.sin(time * 0.31) * 0.10 : 0
    const bobY = suspended ? Math.sin(time * 0.41) * 0.13 + Math.sin(time * 0.17) * 0.05 : 0
    const bobZ = suspended ? Math.sin(time * 0.27) * 0.09 : 0
    const windX     = suspended ? SUSPEND_WIND_X : 1
    const flutter   = suspended ? SUSPEND_FLUTTER : 1
    const gravScale = suspended ? SUSPEND_GRAV : 1

    // ── Force accumulation ──────────────────────────────────────────────────
    for (let i = 0; i < N; i++) {
      if (!suspended && pn[i]) continue
      const ix = i*3, iy = ix+1, iz = ix+2
      const col = i % COLS
      const row = (i / COLS) | 0

      // gravity (+ wet-weather sag); nearly cancelled when suspended
      a[iy] += GRAVITY * gravScale * (1 + extraSag)

      // soft tether to the bobbing / yawing rest pose (suspended mode only)
      if (suspended) {
        const rx = rp[ix], ry = rp[iy], rz = rp[iz]
        const tx = rx * cosS - rz * sinS + bobX
        const tz = rx * sinS + rz * cosS + bobZ
        const ty = ry + bobY
        a[ix] += (tx - p[ix]) * SUSPEND_SPRING
        a[iy] += (ty - p[iy]) * SUSPEND_SPRING
        a[iz] += (tz - p[iz]) * SUSPEND_SPRING
      }

      // wind from fan (inverse-square falloff + turbulence + slow gust envelope)
      if (windStrength > 0) {
        // Gust: wind breathes between ~65% and ~100% so it feels alive, not constant.
        const gust = 0.65 + 0.35 * Math.sin(time * 0.55)
        const w    = windStrength * gust

        const dx   = p[ix] - fanX
        const dy   = p[iy] - fanY
        const dz   = p[iz] - fanZ
        const dist2 = dx*dx + dy*dy + dz*dz
        const fall = Math.min(1.0, 5.0 / (dist2 + 0.4))
        const turb = (Math.sin(time*4.1 + row*0.52) * Math.cos(time*3.3 + col*0.31)) * 0.35
        const wf   = w * (1 + turb) * fall

        a[ix] += -wf * windX                                              // primary blow direction (-X)
        a[iy] += Math.sin(time*2.0 + col*0.21) * w * 0.04 * flutter        // vertical flutter
        a[iz] += Math.sin(time*3.1 + row*0.41 + col*0.19) * w * 0.12 * flutter  // depth billow
      }

      // ambient breeze when the weather itself is windy (independent of the fan)
      if (ambientWind > 0) {
        const gust2 = 0.65 + 0.35 * Math.sin(time * 0.7 + row * 0.12)
        a[ix] += -ambientWind * gust2 * windX
        a[iz] += Math.sin(time * 1.5 + col * 0.2) * ambientWind * 0.08 * flutter
      }

      // rain ripple / hail jolt (high quality only)
      if (highQuality) {
        if (weather === 'rain' && Math.random() < 0.0008) {
          // random droplet strike adds outward ripple from this particle
          a[iy] += -0.018
          a[ix] += (Math.random() - 0.5) * 0.015
          a[iz] += (Math.random() - 0.5) * 0.015
        }
        if (weather === 'hail' && Math.random() < 0.0004) {
          // heavier, sharper jolt
          a[iy] += -0.045
          a[ix] += (Math.random() - 0.5) * 0.03
          a[iz] += (Math.random() - 0.5) * 0.03
        }
      }

      // mouse repulsion / attraction (poke on click)
      if (hasMousePos) {
        const dx   = p[ix] - mouseX
        const dy   = p[iy] - mouseY
        const dz   = p[iz] - mouseZ
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        const r    = isMouseDown ? 0.72 : 0.42
        if (dist < r && dist > 0.001) {
          const f = ((r - dist) / r) * (isMouseDown ? 0.11 : 0.028)
          a[ix] += (dx / dist) * f
          a[iy] += (dy / dist) * f
          a[iz] += (dz / dist) * f
        }
      }
    }

    // ── Verlet integration ──────────────────────────────────────────────────
    for (let i = 0; i < N; i++) {
      if (!suspended && pn[i]) continue
      const ix = i*3, iy = ix+1, iz = ix+2

      const vx = (p[ix] - pp[ix]) * damp
      const vy = (p[iy] - pp[iy]) * damp
      const vz = (p[iz] - pp[iz]) * damp

      pp[ix] = p[ix];  pp[iy] = p[iy];  pp[iz] = p[iz]
      p[ix] += vx + a[ix]
      p[iy] += vy + a[iy]
      p[iz] += vz + a[iz]
      a[ix] = 0;  a[iy] = 0;  a[iz] = 0
    }

    // ── Constraint satisfaction (Jakobsen) ───────────────────────────────────
    const iter = highQuality ? ITERATIONS : Math.floor(ITERATIONS / 2)
    for (let k = 0; k < iter; k++) {
      for (let j = 0; j < nc; j++) {
        const i1 = p1a[j], i2 = p2a[j]
        const x1 = i1*3, y1 = x1+1, z1 = x1+2
        const x2 = i2*3, y2 = x2+1, z2 = x2+2

        const dx   = p[x2]-p[x1]
        const dy   = p[y2]-p[y1]
        const dz   = p[z2]-p[z1]
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        if (dist < 0.0001) continue

        const diff = (dist - la[j]) / dist * 0.5
        const cx = dx*diff, cy = dy*diff, cz = dz*diff

        const lock1 = !suspended && pn[i1]
        const lock2 = !suspended && pn[i2]
        if (!lock1) { p[x1] += cx;  p[y1] += cy;  p[z1] += cz }
        if (!lock2) { p[x2] -= cx;  p[y2] -= cy;  p[z2] -= cz }
      }
    }
  }, [])

  return { positions: pos.current, initCloth, update, applyImpulse }
}
