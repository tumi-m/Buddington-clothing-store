// FILE: src/hooks/useGarmentTexture.ts
// Loads a garment photograph and removes its background so the piece reads as a
// free-floating cutout in the 3D experience (no rectangular "box" around it —
// reference: yeezy.com). Background removal is a multi-source flood fill from
// the image borders: only pixels reachable from the edge AND within a colour
// tolerance of the border tone are cleared, so a same-coloured garment interior
// is never punched through. The result is baked into a CanvasTexture (RGBA with
// a feathered alpha edge) and handed to the cloth material.

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

const WORK_W = 320           // working resolution for the mask (one-time cost)
const LOCAL_TOL = 32         // neighbour-to-neighbour colour distance the grow may cross
const HARD_TOL = 140         // max distance from the border tone — gates leaks into the garment
const MAX_BG_FRACTION = 0.93 // safety: if "background" swallows the garment, bail

function buildCutout(img: HTMLImageElement): HTMLCanvasElement | null {
  const ratio = img.naturalHeight / img.naturalWidth
  const w = Math.min(WORK_W, img.naturalWidth)
  const h = Math.max(1, Math.round(w * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, w, h)

  let imgData: ImageData
  try { imgData = ctx.getImageData(0, 0, w, h) } catch { return null }
  const data = imgData.data
  const n = w * h

  // Border-average colour (the presumed background tone).
  let br = 0, bg = 0, bb = 0, bc = 0
  const sampleBorder = (x: number, y: number) => {
    const i = (y * w + x) * 4
    br += data[i]; bg += data[i + 1]; bb += data[i + 2]; bc++
  }
  for (let x = 0; x < w; x++) { sampleBorder(x, 0); sampleBorder(x, h - 1) }
  for (let y = 0; y < h; y++) { sampleBorder(0, y); sampleBorder(w - 1, y) }
  br /= bc; bg /= bc; bb /= bc

  // Gradient-aware region grow from the border. A pixel joins the background if
  // it is close to its already-background neighbour (so soft studio gradients are
  // followed) AND still within HARD_TOL of the overall border tone (so the grow
  // can't walk deep into a same-edge garment).
  const local2 = LOCAL_TOL * LOCAL_TOL
  const hard2  = HARD_TOL * HARD_TOL
  const mask = new Uint8Array(n)       // 1 = background
  const stack = new Int32Array(n)
  let sp = 0

  // Seed the whole outer ring as background.
  for (let x = 0; x < w; x++) {
    const top = x, bot = (h - 1) * w + x
    mask[top] = 1; stack[sp++] = top
    mask[bot] = 1; stack[sp++] = bot
  }
  for (let y = 0; y < h; y++) {
    const left = y * w, right = y * w + (w - 1)
    if (!mask[left])  { mask[left]  = 1; stack[sp++] = left }
    if (!mask[right]) { mask[right] = 1; stack[sp++] = right }
  }

  const tryGrow = (from: number, to: number) => {
    if (mask[to]) return
    const ti = to * 4, fi = from * 4
    const dl = (data[ti] - data[fi]) ** 2 + (data[ti + 1] - data[fi + 1]) ** 2 + (data[ti + 2] - data[fi + 2]) ** 2
    if (dl >= local2) return
    const dh = (data[ti] - br) ** 2 + (data[ti + 1] - bg) ** 2 + (data[ti + 2] - bb) ** 2
    if (dh >= hard2) return
    mask[to] = 1; stack[sp++] = to
  }

  while (sp > 0) {
    const idx = stack[--sp]
    const x = idx % w
    const y = (idx / w) | 0
    if (x > 0)     tryGrow(idx, idx - 1)
    if (x < w - 1) tryGrow(idx, idx + 1)
    if (y > 0)     tryGrow(idx, idx - w)
    if (y < h - 1) tryGrow(idx, idx + w)
  }

  // Safety bail-out: never erase the whole garment.
  let bgCount = 0
  for (let i = 0; i < n; i++) bgCount += mask[i]
  if (bgCount / n > MAX_BG_FRACTION) return null

  // Feathered alpha: 1px smoothing across the foreground/background boundary so
  // the cut edge isn't aliased.
  for (let i = 0; i < n; i++) {
    const x = i % w
    const y = (i / w) | 0
    let fg = 0, tot = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
        tot++
        if (!mask[yy * w + xx]) fg++
      }
    }
    data[i * 4 + 3] = Math.round((fg / tot) * 255)
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas
}

export function useGarmentTexture(path: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const currentRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    if (!path) {
      setTexture(prev => { if (prev) prev.dispose(); return null })
      currentRef.current = null
      return
    }

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'

    const apply = (tex: THREE.Texture) => {
      tex.colorSpace      = THREE.SRGBColorSpace
      tex.wrapS           = THREE.ClampToEdgeWrapping
      tex.wrapT           = THREE.ClampToEdgeWrapping
      tex.minFilter       = THREE.LinearMipmapLinearFilter
      tex.magFilter       = THREE.LinearFilter
      tex.generateMipmaps = true
      tex.anisotropy      = 4
      tex.needsUpdate     = true
      currentRef.current = tex
      setTexture(prev => { if (prev && prev !== tex) prev.dispose(); return tex })
    }

    img.onload = () => {
      if (cancelled) return
      const cutout = buildCutout(img)
      if (cutout) {
        apply(new THREE.CanvasTexture(cutout))
      } else {
        // Couldn't isolate a clean background — fall back to the raw image.
        apply(new THREE.Texture(img))
      }
    }
    img.onerror = () => { /* missing image — keep previous texture */ }
    img.src = path

    return () => { cancelled = true }
  }, [path])

  // Dispose the held texture on unmount.
  useEffect(() => () => { currentRef.current?.dispose() }, [])

  return texture
}
