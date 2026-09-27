// FILE: src/hooks/useScrollChrome.ts
// Publishes the editorial shell's scroll state onto the scroll container as a
// CSS custom property (`--sp`, 0→1 progress) and a `data-scrolled` flag.
//
// The shell scrolls inside its own element rather than the document, so window
// scroll listeners would never fire. Everything downstream (the progress rail,
// the condensing nav) reads these in CSS, which keeps a per-frame value off
// React's render path entirely — no state, no re-renders while scrolling.

import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useScrollChrome(ref: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const read = () => {
      raf = 0
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
      el.style.setProperty('--sp', p.toFixed(4))
      const scrolled = el.scrollTop > 8 ? '1' : '0'
      if (el.dataset.scrolled !== scrolled) el.dataset.scrolled = scrolled
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(read)
    }

    read()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])
}
