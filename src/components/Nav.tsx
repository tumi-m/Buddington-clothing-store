// FILE: src/components/Nav.tsx
// Global top navigation for the editorial shell. View-state switcher (no router).
//
// Two treatments:
//  - default: white bar, sentence-case links, accent pill for the bag.
//  - loud (home only): the cutlist grammar's bar. Full-width ink, the wordmark
//    and the page's one action set at the same size and weight, because on a
//    page made of hard cuts the bar is the only thing that stays put. No
//    magnetic lean here: that grammar bans it.

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
  tone?: 'default' | 'loud'
}

function useBagBump(count: number): boolean {
  // Bump the bag when the count actually rises, not on every render and not
  // on first paint for a bag restored from storage.
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
  return bump
}

export function Nav({ view, onNavigate, tone = 'default' }: NavProps) {
  const { count, open } = useCart()
  const magnetic = useMagnetic(0.22)
  const bump = useBagBump(count)
  const bagLabel = `Open bag, ${count} item${count === 1 ? '' : 's'}`

  if (tone === 'loud') {
    return (
      <header className="nav-loud sticky top-0 z-40 bg-ink text-paper">
        {/* Phones: the bar condenses (narrower width axis, smaller size) rather than
            dropping anything, because the bag has to stay reachable. */}
        <div className="nav-shell flex h-16 items-center gap-3 px-4 sm:gap-8 sm:px-6 lg:px-10">
          <button
            onClick={() => onNavigate('home')}
            aria-label="Buddington, home"
            className="film-display shrink-0 text-[0.9rem] uppercase text-paper transition-colors duration-150 hover:text-accent-light max-sm:[font-stretch:74%] sm:text-[1.35rem]"
          >
            Buddington
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="film-display min-w-0 shrink text-[0.9rem] uppercase text-accent-light underline decoration-2 underline-offset-[6px] transition-colors duration-150 hover:text-paper max-sm:[font-stretch:74%] sm:text-[1.35rem]"
          >
            Shop the collection
          </button>

          <nav aria-label="Site" className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {ITEMS.filter(i => i.key === 'ghost' || i.key === 'experience').map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="hidden rounded-full px-3 py-1.5 text-[0.85rem] text-paper/70 transition-colors duration-150 hover:bg-white/10 hover:text-paper md:inline-block"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={open}
              aria-label={bagLabel}
              className={`shrink-0 rounded-full border border-paper/30 px-3 py-1.5 text-[0.85rem] sm:px-4 font-medium text-paper transition-colors duration-150 hover:border-paper hover:bg-paper hover:text-ink active:scale-[0.97] ${bump ? 'bump' : ''}`}
            >
              Bag{count > 0 ? ` · ${count}` : ''}
            </button>
          </nav>
        </div>
        <div
          className="scroll-rail absolute inset-x-0 bottom-0 h-[3px] bg-accent-light"
          aria-hidden="true"
        />
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-paper/80 backdrop-blur-xl">
      <div className="nav-shell mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Wordmark: the label drops on the narrowest phones so the nav fits */}
        <button
          onClick={() => onNavigate('home')}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="Buddington, home"
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

        {/* Nav items: scrollable on small screens. `ml-auto` (not justify-end)
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
            aria-label={bagLabel}
            className={`btn-primary magnetic ml-1 shrink-0 px-4 py-1.5 text-[0.85rem] ${bump ? 'bump' : ''}`}
          >
            Bag{count > 0 ? ` · ${count}` : ''}
          </button>
        </nav>
      </div>

      {/* Reading-progress rail: scaleX is driven by --sp on the scroll
          container (useScrollChrome), so it costs no renders. */}
      <div
        className="scroll-rail absolute inset-x-0 bottom-0 h-[2px] bg-accent"
        aria-hidden="true"
      />
    </header>
  )
}
