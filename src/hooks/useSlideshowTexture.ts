import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

// Drop your images into public/images/ — names must match exactly
const SLIDE_IMAGES = [
  '/images/IMG_6300.PNG',
  '/images/IMG_5912.PNG',
  '/images/IMG_5888.PNG',
  '/images/IMG_5822.jpg',
  '/images/IMG_5821.jpg',
  '/images/IMG_5678.PNG',
]

const INTERVAL_MS = 2000

export function useSlideshowTexture() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const loadedRef  = useRef<THREE.Texture[]>([])
  const indexRef   = useRef(0)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let completed = 0

    const tryStart = () => {
      // Start cycling as soon as at least one image is loaded
      if (completed === 1 && loadedRef.current.length > 0) {
        setTexture(loadedRef.current[0])
        timerRef.current = setInterval(() => {
          const pool = loadedRef.current
          if (pool.length === 0) return
          indexRef.current = (indexRef.current + 1) % pool.length
          setTexture(pool[indexRef.current])
        }, INTERVAL_MS)
      }
      // Refresh pool silently as more images finish loading
    }

    SLIDE_IMAGES.forEach(path => {
      loader.load(
        path,
        tex => {
          tex.colorSpace = THREE.SRGBColorSpace
          // Fit the image to fill the cloth without distortion
          tex.wrapS = THREE.ClampToEdgeWrapping
          tex.wrapT = THREE.ClampToEdgeWrapping
          tex.minFilter = THREE.LinearMipmapLinearFilter
          tex.magFilter = THREE.LinearFilter
          tex.generateMipmaps = true
          loadedRef.current = [...loadedRef.current, tex]
          completed++
          tryStart()
        },
        undefined,
        () => {
          // Missing image — skip silently
          completed++
          tryStart()
        }
      )
    })

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      loadedRef.current.forEach(t => t.dispose())
      loadedRef.current = []
    }
  }, [])

  return texture
}
