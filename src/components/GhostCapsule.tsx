// FILE: src/components/GhostCapsule.tsx
// GHOST capsule (specs/DESIGN.md §GHOST capsule). Dark surface, gold accent.
// Sacred Red: none (gold is the accent on this screen). Honesty line per asset-gen.md.

import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'

interface GhostItem {
  code: string
  name: string
  price: string
  /** Real photograph (public/images/) — rendered monochrome to read as GHOST. */
  image: string
}

const GHOST_ITEMS: GhostItem[] = [
  { code: 'GHOST-01', name: 'Spectre Shell',   price: '£ 720', image: '/images/IMG_5678.PNG' },
  { code: 'GHOST-02', name: 'Phantom Hood',   price: '£ 540', image: '/images/IMG_5888.PNG' },
  { code: 'GHOST-03', name: 'Wraith Trouser', price: '£ 430', image: '/images/IMG_5912.PNG' },
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
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* Real photograph, rendered monochrome + darkened to read as GHOST */}
                  <img
                    src={item.image}
                    alt={`${item.name} — GHOST capsule`}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'grayscale(1) contrast(1.08) brightness(0.78)' }}
                  />
                  {/* Ink wash so the image sits in the dark GHOST surface */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(16,16,15,0.25), rgba(16,16,15,0.55))' }}
                    aria-hidden="true"
                  />
                  {/* Adversarial dazzle, kept on top at 8% */}
                  <div
                    className="absolute inset-0 opacity-[0.08] pointer-events-none"
                    style={{ backgroundImage: "url('/generated/ghost-dazzle.svg')", backgroundSize: 'cover' }}
                    aria-hidden="true"
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