// FILE: src/components/Home.tsx
// Home: "Stand still". Built with the scroll-craft procedure; the brief, the
// feeling curve and the score are in scrollcraft/builds/buddington-still/.
//
// Grammar: rhythmic cutlist. Twelve short sections, each painting its own
// ground and ending on a hard edge. Nothing is pinned, nothing has dwell, and
// no layer moves at a scroll-position rate (the grammar bans parallax).
//
// Signature move (useStillness): the hero and the peak are each three planes
// cut from the brand's own photographs: a clean crowd plate, a motion-streaked
// copy of it, and the man as a real alpha cutout. Scroll hard and the crowd
// smears and drifts while he stays sharp; stop and the street freezes. In the
// peak, holding still is what reveals the last line.
// Sacred Red: none on this screen.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { View } from '../types'
import { PRODUCTS, formatPrice } from '../data/products'
import { useStillness } from '../hooks/useStillness'
import { useTilt } from '../hooks/useTilt'
import { Reveal, WordReveal } from './Motion'

export interface HomeProps {
  onNavigate: (v: View) => void
  onOpenProduct: (id: string) => void
}

/** Section frame for one cut. `span` is its height in viewport-heights. */
function Cut({
  span,
  className = '',
  children,
  label,
}: {
  span: number
  className?: string
  children?: ReactNode
  label?: string
}) {
  return (
    <section
      aria-label={label}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ minHeight: `max(${Math.round(span * 100)}svh, ${Math.round(span * 520)}px)` }}
    >
      {children}
    </section>
  )
}

/**
 * The three planes of a layered photograph, held back behind the complete
 * poster frame until every plane has decoded. The switch is instant, not a
 * crossfade: at rest the composite matches the poster pixel for pixel, but
 * mid-fade the half-transparent subject lets the rebuilt gap behind him show
 * through as a ghost.
 */
function FilmScene({
  name,
  subjectAlt,
  objectPosition,
  onReady,
  children,
}: {
  name: 'street' | 'crowd'
  subjectAlt: string
  objectPosition: string
  /** Fires once, when every plane has decoded and the scene has switched in. */
  onReady?: () => void
  /** Rendered between the crowd and the subject, so it passes behind him. */
  children?: ReactNode
}) {
  const [loaded, setLoaded] = useState(0)
  const refs = useRef<(HTMLImageElement | null)[]>([])
  // Images already in the cache can finish before React attaches onLoad.
  useEffect(() => {
    setLoaded(refs.current.filter(img => img?.complete && img.naturalWidth > 0).length)
  }, [])
  const onLoad = () => setLoaded(n => n + 1)
  const ready = loaded >= 3
  const pos: CSSProperties = { objectPosition }
  const readyFired = useRef(false)
  useEffect(() => {
    if (ready && !readyFired.current) {
      readyFired.current = true
      onReady?.()
    }
  }, [ready, onReady])

  return (
    <>
      <img
        src={`/film/${name}-poster.webp`}
        alt=""
        aria-hidden="true"
        className="film-plane"
        style={pos}
        fetchPriority={name === 'street' ? 'high' : 'auto'}
        loading={name === 'street' ? 'eager' : 'lazy'}
        decoding="async"
      />
      <div
        className={`absolute inset-0 ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!ready}
      >
        <img
          ref={el => { refs.current[0] = el }}
          src={`/film/${name}-plate.webp`}
          alt=""
          className="film-plane film-plate"
          style={pos}
          onLoad={onLoad}
          decoding="async"
        />
        <img
          ref={el => { refs.current[1] = el }}
          src={`/film/${name}-streak.webp`}
          alt=""
          className="film-plane film-streak"
          style={pos}
          onLoad={onLoad}
          decoding="async"
        />
      </div>
      {children}
      <img
        ref={el => { refs.current[2] = el }}
        src={`/film/${name}-subject.webp`}
        alt={subjectAlt}
        className={`film-plane z-[2] ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={pos}
        onLoad={onLoad}
        decoding="async"
      />
    </>
  )
}

export function Home({ onNavigate, onOpenProduct }: HomeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const peakRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(7)
  useStillness(rootRef, peakRef)
  // The page opens mid-rush once the hero's planes are on screen, so the
  // mechanic teaches itself without a "scroll" cue.
  const startRush = useCallback(() => {
    rootRef.current?.dispatchEvent(new Event('film:rush'))
  }, [])

  return (
    <div ref={rootRef} className="film">
      {/* ── 1 · Pulse ─────────────────────────────────────────────────────
          The street smears past a man who does not move. On wide screens the
          headline parts around him and passes behind his shoulders. */}
      <section
        aria-label="Stand still"
        className="relative isolate h-[calc(100svh-4rem)] min-h-[560px] overflow-hidden bg-dark-bg text-paper"
      >
        <FilmScene
          name="street"
          objectPosition="50% 42%"
          onReady={startRush}
          subjectAlt="A man in a white Buddington tee stands still on a night street while traffic streaks past him."
        >
          {/* A band of density only where the two words sit, stacked under the
              subject so he keeps the photograph's full brightness. The right of
              the frame is headlights; without this "still." loses its edges. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 z-[1] hidden md:block"
            style={{
              top: '34%',
              height: '36%',
              background:
                'linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.62) 30%, rgba(11,13,18,0.62) 70%, rgba(11,13,18,0) 100%)',
            }}
          />
          <h1
            className="film-display absolute inset-x-0 z-[1] hidden uppercase md:block"
            style={{
              top: '44%',
              fontSize: 'clamp(4rem, 9.6vw, 10rem)',
              textShadow: '0 3px 28px rgba(11,13,18,0.45)',
            }}
          >
            <span className="absolute right-[59vw] whitespace-nowrap">Stand</span>{' '}
            <span className="absolute left-[60.5vw] whitespace-nowrap">still.</span>
            {/* Reserve the line box the absolutely placed words left behind. */}
            <span aria-hidden="true" className="invisible">Stand</span>
          </h1>
        </FilmScene>

        <div className="film-scrim-lead pointer-events-none absolute inset-0 z-[3] hidden md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[30%] bg-gradient-to-t from-dark-bg/90 via-dark-bg/60 to-transparent md:hidden" />

        {/* Phones: the portrait crop leaves him no shoulders to part the
            headline around, so it sits in the street above his head, and the
            rest of the copy sits below his chest, clear of the tee's wordmark. */}
        <p
          aria-hidden="true"
          className="film-display absolute inset-x-0 top-0 z-[4] px-5 pt-4 uppercase leading-[0.86] sm:px-8 md:hidden"
          style={{ fontSize: 'clamp(2.8rem, 16vw, 5rem)', textShadow: '0 3px 24px rgba(11,13,18,0.5)' }}
        >
          Stand<br />still.
        </p>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[26%] bg-gradient-to-b from-dark-bg/75 to-transparent md:hidden" />

        <div className="absolute inset-x-0 bottom-0 z-[4] px-5 pb-6 sm:px-8 md:max-w-[34vw] md:pb-12 lg:px-10">
          <h1 className="sr-only md:hidden">Stand still.</h1>
          <p className="max-w-[26rem] text-[1.02rem] leading-relaxed text-paper/85">
            Clothes for the one person on the street who isn't in a hurry.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-[0.95rem] font-semibold text-ink transition-transform duration-150 hover:bg-accent-light active:scale-[0.97] focus-visible:outline-accent-light"
          >
            Shop the collection <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {/* ── 2 · Impatience ─────────────────────────────────────────────── */}
      <Cut span={0.8} label="Everyone is late for something" className="flex items-center bg-paper text-ink">
        <div className="w-full px-5 py-20 sm:px-8 lg:px-10">
          <WordReveal
            as="h2"
            text="Everyone is late for something."
            stagger={55}
            className="film-display block max-w-[14ch] uppercase"
            style={{ fontSize: 'clamp(2.9rem, 9vw, 9rem)' }}
          />
        </div>
      </Cut>

      {/* ── 3 · Desire ─────────────────────────────────────────────────── */}
      <Cut span={1} label="The weight of silence" className="bg-dark-bg text-paper">
        <Reveal variant="wipe" className="absolute inset-0" innerClassName="absolute inset-0">
          <img
            src="/film/wordmark.webp"
            alt="The Buddington wordmark in iridescent chrome, arched across a black ground."
            loading="lazy"
            decoding="async"
            className="film-plane"
            style={{ objectPosition: '50% 38%' }}
          />
        </Reveal>
        <Reveal
          as="p"
          variant="up"
          delay={260}
          className="absolute bottom-8 right-5 z-[1] text-right text-[1rem] text-paper/80 sm:right-8 lg:right-10"
        >
          A/W 41. The weight of silence.
        </Reveal>
      </Cut>

      {/* ── 4 · Curiosity ──────────────────────────────────────────────── */}
      <Cut span={1} label="Texture, not logo" className="grid items-center bg-paper-2 text-ink md:grid-cols-12">
        <div className="px-5 pb-10 pt-20 sm:px-8 md:col-span-6 md:py-24 lg:col-span-5 lg:px-10">
          <Reveal as="h2" variant="up" className="film-display uppercase" style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}>
            Texture, not logo.
          </Reveal>
          <Reveal as="p" variant="up" delay={70} className="mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-mute">
            Weighted wool melton. Heavy-gauge merino. Waxed cotton. Garments that speak in
            texture rather than logo, cut on the Cape Town to Tokyo axis.
          </Reveal>
          <Reveal variant="up" delay={140} className="mt-8">
            <button
              onClick={() => onNavigate('shop')}
              className="text-[0.95rem] font-semibold text-accent-deep underline decoration-2 underline-offset-[6px] transition-colors duration-150 hover:text-ink"
            >
              Shop the collection
            </button>
          </Reveal>
        </div>
        <Reveal variant="up" delay={120} className="h-full md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
          <img
            src="/film/poster.webp"
            alt="Folded white hoodies seen through tall slats that spell Buddington."
            loading="lazy"
            decoding="async"
            className="h-[70svh] w-full object-cover md:h-[100svh]"
            style={{ objectPosition: '50% 40%' }}
          />
        </Reveal>
      </Cut>

      {/* ── 5 · Amusement ──────────────────────────────────────────────── */}
      <Cut span={0.8} label="We are not that serious" className="grid items-center bg-accent-deep text-white md:grid-cols-2">
        <div className="px-5 pt-20 sm:px-8 md:py-20 lg:px-10">
          <Reveal as="h2" variant="up" className="film-display uppercase" style={{ fontSize: 'clamp(2.6rem, 6.4vw, 6rem)' }}>
            We're not that serious.
          </Reveal>
          <Reveal as="p" variant="up" delay={70} className="mt-5 text-[1.05rem] text-white/90">
            Los Buddington Hermanos. Yes, really.
          </Reveal>
        </div>
        <div className="flex justify-center px-5 pb-16 pt-10 md:py-16">
          <div ref={tilt} className="tilt w-[min(78vw,30rem)]">
            <img
              src="/film/hermanos.webp"
              alt="A light blue tee printed with two cartoon chickens and the words Los Buddington Hermanos."
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl2 shadow-lift"
              width={1047}
              height={1008}
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </Cut>

      {/* ── 6 · Silence ────────────────────────────────────────────────────
          Authored, not dead scroll: the quiet in front of the peak. */}
      <div aria-hidden="true" className="h-[60svh] bg-dark-bg" />

      {/* ── 7 · Stillness · PEAK ───────────────────────────────────────────
          The largest span on the page. The last line only appears once the
          visitor has stopped scrolling with the crowd on screen. */}
      <div ref={peakRef} data-still="0">
        <Cut span={1.4} label="Everyone kept walking" className="bg-dark-bg text-paper">
          <FilmScene
            name="crowd"
            objectPosition="50% 0%"
            subjectAlt="The same man in a white hoodie with the iridescent wordmark, still, while a crowd walks at him."
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[34%] bg-gradient-to-b from-dark-bg/85 via-dark-bg/40 to-transparent" />
          {/* Stops short of the hoodie's wordmark: that is the product, and a
              band scrim across it would sell a dimmer garment than the photo. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[26%] bg-gradient-to-t from-dark-bg/90 via-dark-bg/60 to-transparent" />

          <h2
            className="film-display absolute inset-x-0 top-0 z-[4] px-5 pt-10 uppercase sm:px-8 lg:px-10"
            style={{ fontSize: 'clamp(2.4rem, 7.2vw, 7rem)' }}
          >
            Everyone kept walking.
          </h2>
          <p
            className="film-display film-resolve absolute inset-x-0 bottom-0 z-[4] px-5 pb-12 uppercase text-accent-light sm:px-8 lg:px-10"
            style={{ fontSize: 'clamp(2rem, 5.4vw, 5.2rem)' }}
          >
            You stopped.<br />So did the street.
          </p>
        </Cut>
      </div>

      {/* ── 8 · Warmth ─────────────────────────────────────────────────── */}
      <Cut span={1.1} label="Cape Town to Tokyo" className="bg-paper text-ink">
        <div className="px-5 pb-10 pt-20 sm:px-8 lg:px-10">
          <Reveal as="h2" variant="up" className="film-display max-w-[16ch] uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 5.8rem)' }}>
            Cape Town to Tokyo. Hand to hand.
          </Reveal>
        </div>
        <Reveal variant="wipe-x" delay={120}>
          <img
            src="/film/handoff.webp"
            alt="A Buddington bag passed from a hand in a wax-print sleeve to a hand in a black leather glove."
            loading="lazy"
            decoding="async"
            className="h-[62svh] w-full object-cover md:h-[70svh]"
            style={{ objectPosition: '50% 50%' }}
          />
        </Reveal>
      </Cut>

      {/* ── 9 · Appetite ───────────────────────────────────────────────────
          Every piece, one label schema, no pitch. Each row opens the piece. */}
      <Cut span={1.1} label="Six pieces" className="bg-dark-bg text-paper">
        <div className="px-5 py-20 sm:px-8 lg:px-10">
          <Reveal as="h2" variant="up" className="film-display uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 5.8rem)' }}>
            Six pieces.
          </Reveal>
          <ul className="mt-10 border-t border-white/15">
            {PRODUCTS.map((p, i) => (
              <Reveal as="li" key={p.id} variant="up" delay={i * 55} className="border-b border-white/15">
                <button
                  onClick={() => onOpenProduct(p.id)}
                  aria-label={`${p.name}, ${p.colorway}, ${formatPrice(p)}`}
                  className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 text-left transition-colors duration-150 hover:text-accent-light sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]"
                >
                  <span className="film-display text-[clamp(1.5rem,3.2vw,2.6rem)] uppercase">{p.name}</span>
                  <span className="order-last col-span-2 text-[0.95rem] text-paper/65 sm:order-none sm:col-span-1">{p.colorway}</span>
                  <span className="hidden font-mono text-[0.78rem] text-paper/55 sm:inline">{p.code}</span>
                  <span className="text-[1.05rem] font-medium tabular-nums">{formatPrice(p)}</span>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </Cut>

      {/* ── 10 · Play ──────────────────────────────────────────────────── */}
      <Cut span={0.8} label="Put it in a gale" className="flex items-center bg-paper-2 text-ink">
        <div className="mx-auto w-full max-w-[70rem] px-5 py-20 text-center sm:px-8">
          <WordReveal
            as="h2"
            text="Put it in a gale before you buy it."
            stagger={55}
            className="film-display mx-auto block max-w-[16ch] uppercase"
            style={{ fontSize: 'clamp(2.4rem, 6.4vw, 6.2rem)' }}
          />
          <Reveal as="p" variant="up" delay={300} className="mx-auto mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-mute">
            Hang any piece in the wind tunnel, then set the weather yourself: sun, rain, snow,
            hail or a full gale.
          </Reveal>
          <Reveal variant="up" delay={360} className="mt-8">
            <button
              onClick={() => onNavigate('experience')}
              className="rounded-full border-2 border-ink px-6 py-3 text-[0.95rem] font-semibold transition-colors duration-150 hover:bg-ink hover:text-paper active:scale-[0.97]"
            >
              Open the wind tunnel
            </button>
          </Reveal>
        </div>
      </Cut>

      {/* ── 11 · Intrigue ──────────────────────────────────────────────── */}
      <Cut span={0.8} label="Ghost" className="flex items-center bg-dark-bg text-paper">
        <Reveal variant="iris" className="absolute inset-0" innerClassName="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{ backgroundImage: "url('/generated/ghost-dazzle.svg')", backgroundSize: '520px' }}
            aria-hidden="true"
          />
        </Reveal>
        <div className="relative z-[1] px-5 py-20 sm:px-8 lg:px-10">
          <Reveal as="h2" variant="up" delay={200} className="film-display uppercase" style={{ fontSize: 'clamp(2.6rem, 7vw, 7rem)' }}>
            Ghost // A41
          </Reveal>
          <Reveal as="p" variant="up" delay={260} className="mt-5 max-w-[30rem] text-[1.05rem] leading-relaxed text-paper/80">
            An anti-computer-vision capsule. Tonal dazzle and interference, worn.
          </Reveal>
          <Reveal variant="up" delay={320} className="mt-8">
            <button
              onClick={() => onNavigate('ghost')}
              className="text-[0.95rem] font-semibold text-accent-light underline decoration-2 underline-offset-[6px] transition-colors duration-150 hover:text-paper"
            >
              See the Ghost capsule
            </button>
          </Reveal>
        </div>
      </Cut>

      {/* ── 12 · Decision ──────────────────────────────────────────────────
          The last cut is the action, at full bleed, and it holds. No footer
          after it: an ending that turns into a footer is not an ending. */}
      <Cut span={1} label="Shop the collection" className="flex flex-col justify-between bg-accent-deep text-white">
        <div className="px-5 pt-20 sm:px-8 lg:px-10">
          <button
            onClick={() => onNavigate('shop')}
            aria-label="Shop the collection"
            className="film-display group block text-left uppercase leading-[0.86] transition-transform duration-150 active:scale-[0.99] max-sm:[font-stretch:88%]"
            style={{ fontSize: 'clamp(2.5rem, 12.5vw, 13rem)' }}
          >
            Shop the<br />collection
            <span aria-hidden="true" className="ml-3 inline-block transition-transform duration-150 group-hover:translate-x-2">→</span>
          </button>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-8 text-[0.9rem] text-white/85 sm:px-8 lg:px-10">
          <p>Six pieces. A/W 41. Est. Cape Town MCMLXXXIV.</p>
          <p className="font-jp">バディントン</p>
        </div>
      </Cut>
    </div>
  )
}
