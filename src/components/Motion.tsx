// FILE: src/components/Motion.tsx
// Scroll-driven motion primitives for the editorial shell.
//
// All of them ride the one IntersectionObserver in useReveal: the element
// starts hidden under a `.rv` variant and is unhidden once, the first time it
// enters the viewport. Nothing animates on a loop, nothing animates off-screen,
// and prefers-reduced-motion drops every element straight to its resting state
// (see index.css). Stagger is expressed as transition-delay so a group of
// siblings arrives in sequence without per-element timers.

import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

export type RevealVariant = 'up' | 'rise' | 'scale' | 'blur' | 'wipe' | 'wipe-x'

export interface RevealProps {
  children: ReactNode
  /** How the element arrives. Defaults to a short rise. */
  variant?: RevealVariant
  /** Milliseconds to hold before this element starts. */
  delay?: number
  className?: string
  style?: CSSProperties
  /** Element to render. Defaults to a div. */
  as?: ElementType
}

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  style,
  as: Tag = 'div',
}: RevealProps) {
  const reveal = useReveal()
  // The observed host stays unclipped and untransformed on purpose: the moving
  // part is the inner span. A clipped target (clip-path, or a parent's
  // overflow) reports an empty intersection rectangle, so an observer watching
  // it directly would never fire and the content would never appear.
  return (
    <Tag ref={reveal} className={`rv-host ${className}`} style={style}>
      <span className={`rv rv-${variant}`} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </span>
    </Tag>
  )
}

export interface WordRevealProps {
  /** The line to stagger. Split on spaces; each word rises on its own beat. */
  text: string
  /** Milliseconds between consecutive words. */
  stagger?: number
  /** Milliseconds before the first word. */
  delay?: number
  className?: string
  style?: CSSProperties
  as?: ElementType
}

/**
 * Headline that arrives word by word. Each word sits in a clipping box and
 * rises out of it, so the line assembles rather than fades — the reason the
 * markup is per-word rather than a single element.
 *
 * The full string stays readable to assistive tech via aria-label; the spans
 * themselves are hidden from the accessibility tree so it is not announced as
 * a pile of loose words.
 */
export function WordReveal({
  text,
  stagger = 70,
  delay = 0,
  className = '',
  style,
  as: Tag = 'span',
}: WordRevealProps) {
  const reveal = useReveal()
  const words = text.split(' ')
  return (
    <Tag className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          ref={reveal}
          aria-hidden="true"
          className="rv-host inline-block overflow-hidden align-bottom"
        >
          <span
            className="rv rv-rise"
            // Inline so it beats `.rv { display: block }` without a specificity
            // fight — words must stay on the same line.
            style={{ display: 'inline-block', transitionDelay: `${delay + i * stagger}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

export interface MarqueeProps {
  /** Items repeated across the band. */
  items: string[]
  /** Seconds for one full pass. Longer reads calmer. */
  duration?: number
  /** Run the band right-to-left instead. */
  reverse?: boolean
  className?: string
}

/**
 * Continuous ticker band. The track renders the item list twice and translates
 * by -50%, so the loop is seamless; hovering pauses it. Decorative, so the
 * whole band is hidden from assistive tech.
 */
export function Marquee({ items, duration = 34, reverse = false, className = '' }: MarqueeProps) {
  const run = [...items, ...items]
  return (
    <div
      className={`marquee overflow-hidden ${reverse ? 'marquee-reverse' : ''} ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track" style={{ ['--marquee-duration' as string]: `${duration}s` }}>
        {run.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center whitespace-nowrap">
            <span className="px-6 text-[0.82rem] tracking-tight">{item}</span>
            <span className="text-accent" aria-hidden="true">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
