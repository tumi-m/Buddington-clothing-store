// FILE: src/hooks/useDialogFocus.ts
// Focus management for the bag drawer (and any future modal surface).
//
// Three things a dialog owes a keyboard user, none of which came for free:
//   1. focus moves into the dialog when it opens,
//   2. Tab stays inside it while it is open,
//   3. focus returns to whatever opened it on close.
// Hiding the panel with opacity alone leaves its controls in the tab order, so
// the caller must also take them out of it (visibility/`hidden`) — this hook
// handles focus, not visibility.

import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusable(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  )
}

export function useDialogFocus(panelRef: RefObject<HTMLElement>, isOpen: boolean): void {
  useEffect(() => {
    const panel = panelRef.current
    if (!isOpen || !panel) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Wait a frame: the panel transitions in, and elements are not measurable
    // (so not "focusable" by the filter above) until it has been laid out.
    const raf = requestAnimationFrame(() => {
      const first = focusable(panel)[0]
      if (first) first.focus()
      else {
        panel.tabIndex = -1
        panel.focus()
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusable(panel)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      // Only pull focus back if it is still inside the dialog — otherwise the
      // user has already moved on and stealing it would be worse.
      if (previouslyFocused && panel.contains(document.activeElement)) {
        previouslyFocused.focus()
      }
    }
  }, [panelRef, isOpen])
}
