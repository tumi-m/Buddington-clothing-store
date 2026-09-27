// FILE: src/components/Nav.tsx
// Global top navigation for the editorial shell. View-state switcher (no router).
// Product-site grammar: white bar, sentence-case links, accent pill for the bag.

import { useEffect, useRef, useState } from 'react'
import type { View } from '../types'
import { useCart } from '../cart/CartContext'
import { useMagnetic } from '../hooks/useMagnetic'

interface NavItem {
  key: View
  label: string
}

const ITEMS: NavItem[] = [
  { key: 'home',       label: 'Home' },
  { key: 'shop',       label: 'Collection' },
  { key: 'ghost',      label: 'Ghost' },
  { key: 'experience', label: 'Experience' },
]

export interface NavProps {
  view: View
  onNavigate: (v: View) => void
}

export function Nav({ view, onNavigate }: NavProps) {
  const { count, open } = useCart()
  const magnetic = useMagnetic(0.22)

  // Bump the bag when the count actually changes — not on every render, and
  // not on first paint for a bag restored from storage.
  const [bump, setBump] = useState(false)
  const prevCount = useRef(count)
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true)
      const id = window.setTimeout(() => setBump(false), 460)
      prevCount.current = count
      return () => window.clearTimeout(id)
    }
    prevCount.current = count
  }, [count])

  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-paper/80 backdrop-blur-xl">
      <div className="nav-shell mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Wordmark — the label drops on the narrowest phones so the nav fits */}
        <button
          onClick={() => onNavigate('home')}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="Buddington — home"
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[0.8rem] font-semibold text-white transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            B
          </span>
          <span className="hidden text-[1.05rem] font-semibold tracking-tight text-ink min-[420px]:inline">
            Buddington
          </span>
          <span className="hidden font-jp text-xs text-mute md:inline">バディントン</span>
        </button>

        {/* Nav items — scrollable on small screens. `ml-auto` (not justify-end)
            keeps the row right-aligned without pushing the first item past the
            unreachable left edge when it overflows. */}
        <nav className="no-scrollbar ml-auto flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-2">
          {ITEMS.map(item => {
            const active = view === item.key || (item.key === 'shop' && view === 'product')
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[0.85rem] transition-colors duration-200 ${
                  active
                    ? 'bg-paper-2 font-medium text-ink'
                    : 'text-mute hover:bg-paper-2 hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}

          {/* Bag */}
          <button
            ref={magnetic}
            onClick={open}
            aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
            className={`btn-primary magnetic ml-1 shrink-0 px-4 py-1.5 text-[0.85rem] ${bump ? 'bump' : ''}`}
          >
            Bag{count > 0 ? ` · ${count}` : ''}
          </button>
        </nav>
      </div>

      {/* Reading-progress rail — scaleX is driven by --sp on the scroll
          container (useScrollChrome), so it costs no renders. */}
      <div
        className="scroll-rail absolute inset-x-0 bottom-0 h-[2px] bg-accent"
        aria-hidden="true"
      />
    </header>
  )
}
