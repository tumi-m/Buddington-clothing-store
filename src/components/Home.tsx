// FILE: src/components/Home.tsx
// Home screen — editorial hero (specs/DESIGN.md §Home).
// Sacred Red: none on this screen.

import type { View } from '../types'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'

export interface HomeProps {
  onNavigate: (v: View) => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <>
      <FolioBar roman="I" section="HOME" />

      <section
        className="relative mx-auto max-w-[1600px] px-6 lg:px-12"
        style={{
          backgroundImage: "url('/generated/hero-grain.svg')",
          backgroundBlendMode: 'multiply',
          backgroundSize: '256px 256px',
          opacity: 1,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-20 lg:py-32 min-h-[70vh]">
          {/* Left: headline + lede + CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
            <p
              className="reveal font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-5"
              style={{ animationDelay: '0ms' }}
            >
              AUTUMN / WINTER 2041
            </p>

            <h1
              className="reveal font-serif font-semibold text-ink leading-[0.92]"
              style={{ fontSize: 'clamp(3.25rem, 8vw, 7.5rem)', animationDelay: '120ms' }}
            >
              THE WEIGHT
              <br />
              OF SILENCE
            </h1>

            <p
              className="reveal font-serif text-mute mt-7 max-w-[30rem] leading-relaxed"
              style={{ fontSize: '1.2rem', animationDelay: '240ms' }}
            >
              Garments that speak in textures. A collection born from the quiet weight of
              urban existence — crafted on the Cape Town–Tokyo axis.
            </p>

            <div
              className="reveal flex flex-wrap items-center gap-6 mt-10"
              style={{ animationDelay: '360ms' }}
            >
              <button
                onClick={() => onNavigate('shop')}
                className="font-mono uppercase text-[0.78rem] tracking-[0.14em] text-ink border-b border-ink hover:text-gold hover:border-gold transition-colors pb-1 focus-visible:outline-gold"
              >
                EXPLORE THE COLLECTION →
              </button>
              <button
                onClick={() => onNavigate('ghost')}
                className="font-mono uppercase text-[0.78rem] tracking-[0.14em] text-mute hover:text-ink transition-colors pb-1 focus-visible:outline-gold"
              >
                VIEW LOOKBOOK
              </button>
            </div>
          </div>

          {/* Right: hero image — real photo (public/images/IMG_5678.PNG),
              borderless, bleeds to cell edge per house grammar. object-cover
              crops to the 4/5 plate ratio. */}
          <div
            className="reveal lg:col-span-5 flex items-center order-1 lg:order-2"
            style={{ animationDelay: '480ms' }}
          >
            <div className="w-full max-w-[28rem] ml-auto overflow-hidden">
              <img
                src="/images/IMG_5678.PNG"
                alt="Buddington A/W 41 — hero look"
                loading="eager"
                decoding="sync"
                className="w-full h-full object-cover"
                style={{ aspectRatio: '4 / 5' }}
              />
            </div>
          </div>
        </div>
      </section>

      <FolioFooter />
    </>
  )
}