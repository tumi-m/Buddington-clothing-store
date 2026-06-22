// FILE: src/hooks/useGarmentTexture.ts
// Loads a single garment photograph as the cloth texture (replaces the old
// auto-cycling slideshow). The garment is chosen by the user in the experience
// UI, so the cloth shows the selected piece against the weather + fan.

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

export function useGarmentTexture(path: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const currentRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    if (!path) {
      setTexture(prev => { if (prev) prev.dispose(); return null })
      currentRef.current = null
      return
    }
    const loader = new THREE.TextureLoader()
    loader.load(
      path,
      tex => {
        tex.colorSpace   = THREE.SRGBColorSpace
        tex.wrapS        = THREE.ClampToEdgeWrapping
        tex.wrapT        = THREE.ClampToEdgeWrapping
        tex.minFilter    = THREE.LinearMipmapLinearFilter
        tex.magFilter    = THREE.LinearFilter
        tex.generateMipmaps = true
        currentRef.current = tex
        setTexture(prev => { if (prev && prev !== tex) prev.dispose(); return tex })
      },
      undefined,
      () => { /* missing image — leave previous texture in place */ }
    )
  }, [path])

  // Dispose the held texture on unmount.
  useEffect(() => () => { currentRef.current?.dispose() }, [])

  return texture
}