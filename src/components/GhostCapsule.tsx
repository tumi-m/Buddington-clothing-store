// FILE: src/components/GhostCapsule.tsx
// GHOST capsule — the one dark screen, kept as a deliberate contrast band.
// Accent blue on near-black. Honesty line per asset-gen.md.

import { Reveal, WordReveal, Marquee } from './Motion'
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
  { code: 'GHOST-02', name: 'Phantom Hood',    price: '£ 540', image: '/images/IMG_5888.PNG' },
  { code: 'GHOST-03', name: 'Wraith Trouser',  price: '£ 430', image: '/images/IMG_5912.PNG' },
]

export function GhostCapsule() {
  return (
    <div className="relative min-h-full bg-dark-bg text-paper">
      {/* Tiled animated GHOST background — frozen under prefers-reduced-motion */}
      <div
        className="ghost-drift pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "url('/generated/ghost-voronoi.svg')",
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />
      {/* Accent wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(77,107,254,0.18) 0%, rgba(77,107,254,0) 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <FolioBar roman="IV" section="Ghost" tone="ink" />

        <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal
            as="span"
            variant="up"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[0.7rem] text-paper/70"
          >
            Anti-computer-vision · capsule
          </Reveal>

          <WordReveal
            as="h1"
            text="Ghost // A41"
            stagger={90}
            delay={120}
            className="mt-6 block max-w-[14ch] text-paper"
            style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5rem)', lineHeight: 1.02 }}
          />

          <Reveal
            as="p"
            variant="up"
            delay={340}
            className="mt-6 max-w-[36rem] text-paper/60"
            style={{ fontSize: '1.08rem', lineHeight: 1.65 }}
          >
            A sub-line that breaks silhouette against the gaze of machines: tonal dazzle,
            interference, and negative space worn as armour.
          </Reveal>

          {/* Three GHOST items */}
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {GHOST_ITEMS.map((item, i) => (
              <Reveal
                key={item.code}
                variant="wipe"
                delay={i * 120}
                className="group overflow-hidden rounded-xl2 border border-white/10 bg-dark-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                  {/* Real photograph, rendered monochrome + darkened to read as GHOST */}
                  <img
                    src={item.image}
                    alt={`${item.name}, Ghost capsule`}
                    loading="lazy"
                    decoding="async"
                    className="media-zoom absolute inset-0 h-full w-full object-cover"
                    style={{ filter: 'grayscale(1) contrast(1.08) brightness(0.72)' }}
                  />
                  {/* Ink wash so the image sits in the dark GHOST surface */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(11,13,18,0.20), rgba(11,13,18,0.60))' }}
                    aria-hidden="true"
                  />
                  {/* Adversarial dazzle, kept on top at 8% */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: "url('/generated/ghost-dazzle.svg')", backgroundSize: 'cover' }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                  <div>
                    <p className="text-[0.95rem] text-paper">{item.name}</p>
                    <p className="mt-0.5 font-mono text-[0.68rem] text-paper/40">{item.code}</p>
                  </div>
                  <span className="shrink-0 text-[0.9rem] font-medium text-accent">{item.price}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Counter-running ticker — the capsule's own drumbeat */}
        <div className="border-y border-white/10 py-3.5 text-paper/35">
          <Marquee
            items={['Ghost // A41', 'Tonal dazzle', 'Negative space as armour', 'Cape Town — Tokyo']}
            duration={30}
            reverse
          />
        </div>

        <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          {/* Honest framing line (asset-gen.md) */}
          <p className="max-w-[50rem] text-[0.82rem] leading-relaxed text-paper/40">
            Ghost is an aesthetic homage to adversarial fashion, not a guaranteed defeat of
            computer vision.
          </p>
        </section>

        <FolioFooter tone="ink" />
      </div>
    </div>
  )
}
