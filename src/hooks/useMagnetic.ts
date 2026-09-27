// FILE: src/hooks/useMagnetic.ts
// Makes a control lean toward the pointer, then spring back on leave.
//
// Offsets are written to CSS custom properties (--mx/--my) that the `.magnetic`
// class consumes, so pointer movement never enters React's render path. Only
// fine pointers get it: on touch there is no hover to lean into, and under
// prefers-reduced-motion the element simply never moves.

import { useCallback, useRef } from 'react'

export function useMagnetic(strength = 0.28): (node: HTMLElement | null) => void {
  const cleanup = useRef<(() => void) | null>(null)

  // Deliberately no mount effect. React always calls a ref callback with null
  // before detaching, so teardown belongs there — and a mount effect's cleanup
  // would fire during StrictMode's simulated remount, stripping the listeners
  // off a node the ref callback is never asked about again.
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
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      node.style.setProperty('--mx', `${(dx * strength).toFixed(2)}px`)
      node.style.setProperty('--my', `${(dy * strength).toFixed(2)}px`)
    }
    const reset = () => {
      node.style.setProperty('--mx', '0px')
      node.style.setProperty('--my', '0px')
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', reset)
    node.addEventListener('blur', reset)
    cleanup.current = () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', reset)
      node.removeEventListener('blur', reset)
      reset()
    }
  }, [strength])
}
