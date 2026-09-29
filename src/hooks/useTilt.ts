// FILE: src/hooks/useTilt.ts
// Tilts an object toward the pointer, like something you could pick up.
//
// Writes --tx/--ty (degrees) for the `.tilt` class to consume, so pointer
// movement stays off React's render path. Fine pointers only, and inert under
// reduced motion. Teardown lives in the ref callback, not a mount effect, for
// the same StrictMode reason documented in useMagnetic.

import { useCallback, useRef } from 'react'

export function useTilt(maxDeg = 7): (node: HTMLElement | null) => void {
  const cleanup = useRef<(() => void) | null>(null)

  return useCallback((node: HTMLElement | null) => {
    cleanup.current?.()
    cleanup.current = null
    if (!node) return
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const onMove = (e: PointerEvent) => {
      const r = node.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      node.style.setProperty('--tx', `${(nx * 2 * maxDeg).toFixed(2)}deg`)
      node.style.setProperty('--ty', `${(-ny * 2 * maxDeg).toFixed(2)}deg`)
    }
    const reset = () => {
      node.style.setProperty('--tx', '0deg')
      node.style.setProperty('--ty', '0deg')
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', reset)
    cleanup.current = () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', reset)
      reset()
    }
  }, [maxDeg])
}
