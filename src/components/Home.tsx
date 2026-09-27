// FILE: src/components/Home.tsx
// Home screen — product-site hero with staggered word entrance, a shutter-wipe
// hero plate, a continuous ticker band, then a three-up feature row.
// Sacred Red: none on this screen.

import type { View } from '../types'
import { Reveal, WordReveal, Marquee } from './Motion'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'

export interface HomeProps {
  onNavigate: (v: View) => void
}

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Made on the Cape Town–Tokyo axis',
    body: 'Every piece is drafted in Cape Town and finished against Japanese technical patterning. Two cities, one block.',
  },
  {
    title: 'Materials chosen for weight',
    body: 'Virgin wool melton, waxed cotton, heavy-gauge merino. We pick cloth for how it hangs, not how it photographs.',
  },
  {
    title: 'Worn in the elements',
    body: 'Take any garment into the wind tunnel and put it under rain, snow or a full gale before you commit to it.',
  },
]

const TICKER = [
  'Autumn / Winter 2041',
  'Est. Cape Town MCMLXXXIV',
  'Six pieces',
  'Cape Town — Tokyo',
  'Free returns within 30 days',
  'バディントン',
]

export function Home({ onNavigate }: HomeProps) {
  return (
    <>
      <FolioBar roman="I" section="Home" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Soft accent wash behind the headline */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgba(77,107,254,0.10) 0%, rgba(77,107,254,0) 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-8 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
          <Reveal as="p" variant="up" className="pill mx-auto">
            Autumn / Winter 2041
          </Reveal>

          <WordReveal
            as="h1"
            text="The weight of silence"
            stagger={80}
            delay={120}
            className="mx-auto mt-6 block max-w-[16ch] text-ink"
            style={{ fontSize: 'clamp(2.5rem, 6.2vw, 4.75rem)', lineHeight: 1.04 }}
          />

          <Reveal
            as="p"
            variant="up"
            delay={380}
            className="mx-auto mt-6 max-w-[38rem] text-mute"
            style={{ fontSize: 'clamp(1rem, 1.6vw, 1.18rem)', lineHeight: 1.65 }}
          >
            Garments that speak in texture rather than logo. A collection born from the quiet
            weight of urban existence — crafted on the Cape Town–Tokyo axis.
          </Reveal>

          <Reveal
            variant="up"
            delay={480}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <button onClick={() => onNavigate('shop')} className="btn-primary">
              Explore the collection
              <span aria-hidden="true">→</span>
            </button>
            <button onClick={() => onNavigate('experience')} className="btn-secondary">
              Enter the wind tunnel
            </button>
          </Reveal>

          <Reveal as="p" variant="up" delay={560} className="mt-4 text-[0.8rem] text-mute">
            Six pieces · Free returns within 30 days
          </Reveal>
        </div>

        {/* Framed hero plate — opens like a shutter */}
        <div className="relative mx-auto max-w-[1000px] px-4 pb-14 sm:px-6 lg:px-8">
          <Reveal variant="wipe" delay={320} className="card group overflow-hidden shadow-lift">
            <img
              src="/images/IMG_5678.PNG"
              alt="Buddington A/W 41 — hero look"
              loading="eager"
              decoding="sync"
              className="media-zoom w-full object-cover"
              style={{ aspectRatio: '16 / 10' }}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Ticker band ──────────────────────────────────────────────────── */}
      <section className="border-y border-hair bg-paper-2 py-3.5">
        <Marquee items={TICKER} duration={38} className="text-mute" />
      </section>

      {/* ── Feature row ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} variant="up" delay={i * 110} className="card card-hover p-6">
              <div
                className="mb-4 h-8 w-8 rounded-lg bg-accent/10 ring-1 ring-inset ring-accent/20"
                aria-hidden="true"
              />
              <h2 className="text-[1.05rem] text-ink">{f.title}</h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Closing band ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal
          variant="scale"
          className="card overflow-hidden bg-paper-2 px-6 py-14 text-center sm:px-12"
        >
          <WordReveal
            as="h2"
            text="See how it moves before you buy it"
            stagger={55}
            className="mx-auto block max-w-[20ch] text-ink"
            style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.5rem)', lineHeight: 1.15 }}
          />
          <p className="mx-auto mt-4 max-w-[34rem] text-[0.98rem] leading-relaxed text-mute">
            Every garment can be suspended in a live wind tunnel and tested against five weather
            systems. Scroll the flight, then judge the drape for yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => onNavigate('experience')} className="btn-primary">
              Launch the experience
            </button>
            <button onClick={() => onNavigate('ghost')} className="btn-secondary">
              View the Ghost capsule
            </button>
          </div>
        </Reveal>
      </section>

      <FolioFooter />
    </>
  )
}
