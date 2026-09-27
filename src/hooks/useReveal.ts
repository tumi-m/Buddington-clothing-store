// FILE: src/hooks/useReveal.ts
// Scroll-triggered reveal for the editorial shell. One shared
// IntersectionObserver per hook instance adds `.is-inview` (see index.css
// `.reveal-scroll`) the first time an element enters the viewport, then stops
// watching it. Under prefers-reduced-motion (or without IntersectionObserver)
// elements are shown immediately — content is never hidden behind motion.

import { useCallback, useEffect, useRef } from 'react'

/** True when reveals must be skipped and content shown straight away. */
function showImmediately(): boolean {
  return (
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useReveal(): (node: HTMLElement | null) => void {
  // Every node handed to the ref callback, so the observer can be rebuilt
  // without losing its targets. StrictMode mounts effects twice in dev, and the
  // first cleanup disconnects the observer — without this set the second pass
  // would have nothing to watch and the content would stay invisible.
  const nodes = useRef<Set<HTMLElement>>(new Set())
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (showImmediately()) {
      nodes.current.forEach(n => n.classList.add('is-inview'))
      return
    }
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // Reveal when the element comes into view, and also when it has been
          // scrolled clean past (a jump to the bottom of the page never yields
          // an intersecting frame for the sections in between — without this
          // they would stay invisible above the viewport forever).
          const passed = entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0)
          if (!entry.isIntersecting && !passed) continue
          entry.target.classList.add('is-inview')
          io.unobserve(entry.target)
          nodes.current.delete(entry.target as HTMLElement)
        }
      },
      // threshold 0: any sliver counts. Reveal hosts are deliberately unclipped
      // (see Motion.tsx), but a 0 threshold keeps this robust for short
      // elements and for targets whose size settles after images load.
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    observer.current = io
    nodes.current.forEach(n => io.observe(n))
    return () => {
      io.disconnect()
      observer.current = null
    }
  }, [])

  return useCallback((node: HTMLElement | null) => {
    if (!node) return
    if (showImmediately()) {
      node.classList.add('is-inview')
      return
    }
    // On the first commit the effect has not run yet, so the observer may be
    // null — the effect picks every tracked node up when it creates one.
    nodes.current.add(node)
    observer.current?.observe(node)
  }, [])
}
