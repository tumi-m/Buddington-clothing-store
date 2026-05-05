import { useRef, useCallback } from 'react'

// Cloth grid dimensions — 30×20 gives 600 particles (good perf/quality balance)
export const COLS = 30
export const ROWS = 20
export const CLOTH_W = 4.0  // world-space width
export const CLOTH_H = 3.0  // world-space height
const N = COLS * ROWS

const GRAVITY     = -0.0055
const DAMPING     = 0.99
const ITERATIONS  = 8   // constraint solving passes per frame

export interface ClothPhysicsHandle {
  positions: Float32Array
  initCloth: () => void
  update: (params: UpdateParams) => void
}

export interface UpdateParams {
  windStrength: number
  fanX: number
  fanY: number
  fanZ: number
  mouseX: number
  mouseY: number
  mouseZ: number
  hasMousePos: boolean
  isMouseDown: boolean
  time: number
}

export function useClothPhysics(): ClothPhysicsHandle {
  // Flat typed arrays — avoids per-frame GC pressure
  const pos  = useRef(new Float32Array(N * 3))
  const prev = useRef(new Float32Array(N * 3))
  const acc  = useRef(new Float32Array(N * 3))
  const pin  = useRef(new Uint8Array(N))

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

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i  = row * COLS + col
        const x  = (col / (COLS - 1) - 0.5) * CLOTH_W
        const y  = (0.5 - row / (ROWS - 1)) * CLOTH_H
        const z  = 0
        p[i*3]     = x;  p[i*3+1]   = y;  p[i*3+2]   = z
        pp[i*3]    = x;  pp[i*3+1]  = y;  pp[i*3+2]  = z
        pn[i] = row === 0 ? 1 : 0   // pin entire top row
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

  const update = useCallback((params: UpdateParams) => {
    if (!ready.current) return

    const { windStrength, fanX, fanY, fanZ,
            mouseX, mouseY, mouseZ, hasMousePos, isMouseDown, time } = params

    const p   = pos.current
    const pp  = prev.current
    const a   = acc.current
    const pn  = pin.current
    const p1a = cP1.current
    const p2a = cP2.current
    const la  = cLen.current
    const nc  = cNum.current

    // ── Force accumulation ──────────────────────────────────────────────────
    for (let i = 0; i < N; i++) {
      if (pn[i]) continue
      const ix = i*3, iy = ix+1, iz = ix+2
      const col = i % COLS
      const row = (i / COLS) | 0

      // gravity
      a[iy] += GRAVITY

      // wind from fan (inverse-square falloff + turbulence)
      if (windStrength > 0) {
        const dx   = p[ix] - fanX
        const dy   = p[iy] - fanY
        const dz   = p[iz] - fanZ
        const dist2 = dx*dx + dy*dy + dz*dz
        const fall = Math.min(1.0, 5.0 / (dist2 + 0.4))
        const turb = (Math.sin(time*4.1 + row*0.52) * Math.cos(time*3.3 + col*0.31)) * 0.35
        const wf   = windStrength * (1 + turb) * fall

        a[ix] += -wf                                                          // primary blow direction (-X)
        a[iy] += Math.sin(time*2.0 + col*0.21) * windStrength * 0.04         // vertical flutter
        a[iz] += Math.sin(time*3.1 + row*0.41 + col*0.19) * windStrength * 0.12 // depth wave
      }

      // mouse repulsion / attraction
      if (hasMousePos) {
        const dx   = p[ix] - mouseX
        const dy   = p[iy] - mouseY
        const dz   = p[iz] - mouseZ
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        const r    = isMouseDown ? 0.65 : 0.38
        if (dist < r && dist > 0.001) {
          const f = ((r - dist) / r) * (isMouseDown ? 0.09 : 0.025)
          a[ix] += (dx / dist) * f
          a[iy] += (dy / dist) * f
          a[iz] += (dz / dist) * f
        }
      }
    }

    // ── Verlet integration ──────────────────────────────────────────────────
    for (let i = 0; i < N; i++) {
      if (pn[i]) continue
      const ix = i*3, iy = ix+1, iz = ix+2

      const vx = (p[ix] - pp[ix]) * DAMPING
      const vy = (p[iy] - pp[iy]) * DAMPING
      const vz = (p[iz] - pp[iz]) * DAMPING

      pp[ix] = p[ix];  pp[iy] = p[iy];  pp[iz] = p[iz]
      p[ix] += vx + a[ix]
      p[iy] += vy + a[iy]
      p[iz] += vz + a[iz]
      a[ix] = 0;  a[iy] = 0;  a[iz] = 0
    }

    // ── Constraint satisfaction (Jakobsen) ───────────────────────────────────
    for (let iter = 0; iter < ITERATIONS; iter++) {
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

        if (!pn[i1]) { p[x1] += cx;  p[y1] += cy;  p[z1] += cz }
        if (!pn[i2]) { p[x2] -= cx;  p[y2] -= cy;  p[z2] -= cz }
      }
    }
  }, [])

  return { positions: pos.current, initCloth, update }
}
