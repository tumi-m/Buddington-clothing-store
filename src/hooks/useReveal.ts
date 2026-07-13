// FILE: src/hooks/useReveal.ts
// Scroll-triggered reveal for the editorial shell. One shared
// IntersectionObserver per hook instance adds `.is-inview` (see index.css
// `.reveal-scroll`) the first time an element enters the viewport, then stops
// watching it. Under prefers-reduced-motion (or without IntersectionObserver)
// elements are shown immediately — content is never hidden behind motion.

import { useCallback, useEffect, useRef } from 'react'

export function useReveal(): (node: HTMLElement | null) => void {
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => () => observer.current?.disconnect(), [])

  return useCallback((node: HTMLElement | null) => {
    if (!node) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      node.classList.add('is-inview')
      return
    }
    observer.current ??= new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview')
            observer.current?.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    observer.current.observe(node)
  }, [])
}
