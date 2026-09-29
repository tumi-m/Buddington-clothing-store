// FILE: src/components/ProductDetail.tsx
// Product detail. Two-column: framed plates left, spec column right.
// Uses <details> for the spec accordion — accessible, no JS, keyboard-operable.

import { useState } from 'react'
import { useMagnetic } from '../hooks/useMagnetic'
import type { Product } from '../data/products'
import { formatPrice } from '../data/products'
import { useCart } from '../cart/CartContext'
import { Reveal, WordReveal } from './Motion'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const

export interface ProductDetailProps {
  product: Product
  onBack: () => void
  onViewInElements: (garmentId: string) => void
}

export function ProductDetail({ product, onBack, onViewInElements }: ProductDetailProps) {
  const { addItem } = useCart()
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const magnetic = useMagnetic(0.2)

  const addToBag = () => {
    if (!size) {
      // Don't silently add an unsized garment — say what is missing.
      setError(true)
      return
    }
    setError(false)
    addItem({
      id: product.id, code: product.code, name: product.name,
      price: product.price, currency: product.currency, image: product.image ?? '',
      size,
    })
  }

  const chooseSize = (s: string) => {
    setSize(s)
    setError(false)
  }

  return (
    <>
      <FolioBar roman="III" section="Product" />

      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-8 text-[0.85rem] text-mute transition-colors hover:text-ink focus-visible:outline-accent"
        >
          ← Back to the collection
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Left: plates */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <Reveal variant="wipe" className="card group overflow-hidden bg-paper-2">
              {product.image ? (
                <img
                  src={product.image}
                  alt={`${product.name}, front`}
                  loading="eager"
                  decoding="sync"
                  className="media-zoom w-full object-cover"
                  style={{ aspectRatio: '4/5' }}
                />
              ) : (
                <AssetPlate label={`${product.code} / FRONT`} ratio="4/5" tone="paper" className="w-full" />
              )}
            </Reveal>
            {/* Back plate — always AssetPlate until a back photo exists */}
            <Reveal variant="wipe" delay={140} className="card overflow-hidden">
              <AssetPlate label={`${product.code} / BACK`} ratio="4/5" tone="paper" className="w-full" />
            </Reveal>
          </div>

          {/* Right: details */}
          <div className="flex flex-col">
            <Reveal variant="up" className="flex flex-wrap items-center gap-2">
              <span className="pill">{product.code}</span>
              {product.badge && (
                <span
                  className={`rounded-full px-3 py-1 text-[0.7rem] font-medium ${
                    product.badge === 'LAST PIECE'
                      ? 'bg-signal/10 text-signal'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {product.badge === 'LAST PIECE' ? 'Last piece' : 'New'}
                </span>
              )}
            </Reveal>

            <WordReveal
              as="h1"
              text={product.name}
              stagger={80}
              delay={120}
              className="mt-5 block text-ink"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.06 }}
            />

            <Reveal as="p" variant="up" delay={240} className="mt-4 text-[1.6rem] font-medium text-ink">
              {formatPrice(product)}
            </Reveal>
            <Reveal as="p" variant="up" delay={290} className="mt-1.5 text-[0.9rem] text-mute">
              {product.colorway}
            </Reveal>

            <Reveal
              as="p"
              variant="up"
              delay={350}
              className="mt-6 max-w-[34rem] text-[1.02rem] leading-relaxed text-mute"
            >
              {product.description}
            </Reveal>

            {/* Size — required before a piece can go in the bag */}
            <Reveal variant="up" delay={390} className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <span id="size-label" className="text-[0.9rem] font-medium text-ink">Size</span>
                <span className="text-[0.8rem] text-mute">
                  {size ? `Selected: ${size}` : 'Cut oversized. See sizing below.'}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-labelledby="size-label"
                className="mt-3 flex flex-wrap gap-2"
              >
                {SIZES.map(s => {
                  const active = size === s
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => chooseSize(s)}
                      className={`h-11 min-w-[3rem] rounded-full border px-4 text-[0.88rem] transition-all duration-200 focus-visible:outline-accent ${
                        active
                          ? 'border-transparent bg-ink font-medium text-paper'
                          : 'border-hair text-ink hover:border-accent hover:text-accent'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
              <p
                role="alert"
                className={`mt-2.5 text-[0.82rem] text-signal transition-opacity duration-200 ${
                  error ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'
                }`}
              >
                Choose a size first.
              </p>
            </Reveal>

            <Reveal variant="up" delay={420} className="mt-6 flex flex-wrap items-center gap-3">
              <button ref={magnetic} onClick={addToBag} className="btn-primary magnetic">
                Add to bag
              </button>
              <button onClick={() => onViewInElements(product.id)} className="btn-secondary">
                View in the elements
              </button>
            </Reveal>

            {/* Spec accordion */}
            <div className="mt-10 border-t border-hair">
              {SPECS.map((s, i) => (
                <Reveal key={s.label} variant="up" delay={i * 90}>
                  <details className="group border-b border-hair">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 focus-visible:outline-accent">
                      <span className="text-[0.95rem] font-medium text-ink">{s.label}</span>
                      <span className="text-mute transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-5 text-[0.92rem] leading-relaxed text-mute">{s.body}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FolioFooter />
    </>
  )
}

const SPECS: { label: string; body: string }[] = [
  { label: 'Composition', body: 'Primary: virgin wool melton. Lining: cupro. Trim: rayon thread, blind-stitched.' },
  { label: 'Care', body: 'Do not wash. Professional dry-clean only. Steam to refresh. Store on a broad hanger.' },
  { label: 'Sizing', body: 'Cut oversized. Model wears M (height 188cm). Drop shoulder; consult the Buddington size chart.' },
]
