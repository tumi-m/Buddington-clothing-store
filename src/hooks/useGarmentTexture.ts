// FILE: src/hooks/useGarmentTexture.ts
// Loads a garment photograph and removes its background (see lib/cutout) so the
// piece reads as a free-floating cutout in the 3D experience — no rectangular
// "box". The result is baked into a CanvasTexture (RGBA, feathered alpha edge)
// and handed to the cloth material.

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildCutoutCanvas } from '../lib/cutout'

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
      const cutout = buildCutoutCanvas(img)
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
