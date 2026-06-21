// FILE: src/components/Nav.tsx
// Global top navigation for the editorial shell. View-state switcher (no router).

import type { View } from '../types'

interface NavItem {
  key: View
  label: string
}

const ITEMS: NavItem[] = [
  { key: 'home',       label: 'HOME' },
  { key: 'shop',       label: 'SHOP' },
  { key: 'ghost',      label: 'GHOST' },
  { key: 'experience', label: 'EXPERIENCE' },
]

export interface NavProps {
  view: View
  onNavigate: (v: View) => void
}

export function Nav({ view, onNavigate }: NavProps) {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-hair">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-baseline gap-2 group"
          aria-label="Buddington — home"
        >
          <span className="font-serif text-2xl tracking-wide text-ink group-hover:text-gold transition-colors">
            BUDDINGTON
          </span>
          <span className="font-jp text-sm text-mute hidden sm:inline">バディントン</span>
        </button>

        {/* Nav items */}
        <nav className="flex items-center gap-5 sm:gap-8">
          {ITEMS.map(item => {
            const active = view === item.key || (item.key === 'shop' && view === 'product')
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`font-mono uppercase text-[0.7rem] tracking-[0.14em] transition-colors ${
                  active
                    ? 'text-ink border-b border-gold pb-0.5'
                    : 'text-mute hover:text-ink border-b border-transparent pb-0.5'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}