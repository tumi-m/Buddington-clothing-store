// FILE: src/components/GhostCapsule.tsx
// GHOST capsule (specs/DESIGN.md §GHOST capsule). Dark surface, gold accent.
// Sacred Red: none (gold is the accent on this screen). Honesty line per asset-gen.md.

import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

interface GhostItem {
  code: string
  name: string
  price: string
}

const GHOST_ITEMS: GhostItem[] = [
  { code: 'GHOST-01', name: 'Spectre Shell',   price: '£ 720' },
  { code: 'GHOST-02', name: 'Phantom Hood',   price: '£ 540' },
  { code: 'GHOST-03', name: 'Wraith Trouser', price: '£ 430' },
]

export function GhostCapsule() {
  return (
    <div className="relative bg-ink text-paper min-h-full">
      {/* Tiled animated GHOST background — frozen under prefers-reduced-motion */}
      <div
        className="ghost-drift absolute inset-0 pointer-events-none opacity-[0.1]"
        style={{
          backgroundImage: "url('/generated/ghost-voronoi.svg')",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <FolioBar roman="IV" section="GHOST" tone="ink" />

        <section className="mx-auto max-w-[1600px] px-6 lg:px-12 py-16 lg:py-24">
          <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-5">
            ANTI-COMPUTER-VISION · CAPSULE
          </p>

          <h1
            className="reveal font-serif font-semibold text-paper leading-[0.95]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            GHOST // A41
          </h1>

          <p
            className="reveal font-serif text-paper/70 mt-6 max-w-[30rem]"
            style={{ fontSize: '1.2rem', animationDelay: '120ms' }}
          >
            A sub-line that breaks silhouette against the gaze of machines — tonal dazzle,
            interference, and negative space worn as armour.
          </p>

          {/* Three GHOST items — ink cards, dazzle at 8% behind each plate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14">
            {GHOST_ITEMS.map(item => (
              <div key={item.code} className="bg-ink border border-gold-dark/40">
                <div
                  className="relative"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.08] pointer-events-none"
                    style={{ backgroundImage: "url('/generated/ghost-dazzle.svg')", backgroundSize: 'cover' }}
                    aria-hidden="true"
                  />
                  <AssetPlate
                    label={`${item.code} / FRONT`}
                    ratio="1 / 1"
                    tone="ink"
                    className="relative w-full h-full"
                  />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-mono uppercase text-[0.72rem] tracking-[0.14em] text-paper">
                    {item.name}
                  </span>
                  <span className="font-mono text-gold text-[0.78rem]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Honest framing line (asset-gen.md) */}
          <p className="font-mono uppercase text-mute mt-12 tracking-[0.14em]" style={{ fontSize: '0.7rem' }}>
            GHOST IS AN AESTHETIC HOMAGE TO ADVERSARIAL FASHION — NOT A GUARANTEED CV DEFEAT.
          </p>
        </section>

        <FolioFooter tone="ink" />
      </div>
    </div>
  )
}