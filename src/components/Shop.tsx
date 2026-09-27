// FILE: src/components/Shop.tsx
// Collection grid. Reads from src/data/products.ts.
// Signal red (#e5484d): AT MOST ONE per screen — used for the FIRST "LAST PIECE"
// badge only; subsequent badges fall back to the neutral pill.

import { useState } from 'react'
import type { View } from '../types'
import { PRODUCTS, formatPrice, type Product, type ProductCategory } from '../data/products'
import { useCart } from '../cart/CartContext'
import { Reveal, WordReveal } from './Motion'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

type Filter = 'ALL' | ProductCategory

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL',        label: 'All' },
  { key: 'outerwear',  label: 'Outerwear' },
  { key: 'tailoring',  label: 'Tailoring' },
  { key: 'knitwear',   label: 'Knitwear' },
  { key: 'trousers',   label: 'Trousers' },
]

export interface ShopProps {
  onOpenProduct: (id: string) => void
  onNavigate: (v: View) => void
  onViewInElements: (garmentId: string) => void
}

export function Shop({ onOpenProduct, onNavigate, onViewInElements }: ShopProps) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const shown = filter === 'ALL' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter)

  // Signal-red budget: only the first LAST PIECE in the rendered set gets signal.
  let redUsed = false

  return (
    <>
      <FolioBar roman="II" section="Collection" />

      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Section head */}
        <Reveal as="p" variant="up" className="pill">The collection</Reveal>
        <WordReveal
          as="h1"
          text="Autumn / Winter 2041"
          stagger={70}
          delay={100}
          className="mt-5 block max-w-[18ch] text-ink"
          style={{ fontSize: 'clamp(2rem, 4.4vw, 3.25rem)', lineHeight: 1.1 }}
        />
        <Reveal
          as="p"
          variant="up"
          delay={280}
          className="mt-4 max-w-[36rem] text-[1rem] leading-relaxed text-mute"
        >
          Six pieces, cut for weight and drape. Open any garment to read its spec, or take it
          straight into the wind tunnel.
        </Reveal>

        {/* Filter chips */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-hair pb-6">
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-[0.85rem] transition-colors duration-200 focus-visible:outline-accent ${
                  active
                    ? 'bg-ink font-medium text-paper'
                    : 'border border-hair text-mute hover:border-accent hover:text-accent'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => {
            const isLastPiece = p.badge === 'LAST PIECE'
            const useRed = isLastPiece && !redUsed
            if (useRed) redUsed = true
            return (
              <Reveal
                key={p.id}
                variant="wipe"
                delay={(i % 3) * 110}
                className="h-full"
              >
                <ProductCard
                  product={p}
                  badgeTone={useRed ? 'signal' : p.badge ? 'neutral' : 'none'}
                  onOpen={() => onOpenProduct(p.id)}
                  onViewInElements={() => onViewInElements(p.id)}
                />
              </Reveal>
            )
          })}
        </div>

        {/* Empty state */}
        {shown.length === 0 && (
          <div className="card mt-10 px-6 py-14 text-center">
            <p className="text-[0.95rem] text-mute">Nothing in this category yet.</p>
            <button onClick={() => setFilter('ALL')} className="btn-secondary mt-5">
              View all pieces
            </button>
          </div>
        )}

        {/* Closing prompt */}
        <Reveal
          variant="scale"
          className="card mt-14 flex flex-col items-start gap-5 bg-paper-2 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div>
            <h2 className="text-[1.25rem] text-ink">Not sure how it hangs?</h2>
            <p className="mt-1.5 text-[0.92rem] text-mute">
              Put any piece under wind, rain, snow or hail in the live wind tunnel.
            </p>
          </div>
          <button onClick={() => onNavigate('experience')} className="btn-primary shrink-0">
            Open the experience
          </button>
        </Reveal>
      </section>

      <FolioFooter />
    </>
  )
}

interface ProductCardProps {
  product: Product
  badgeTone: 'signal' | 'neutral' | 'none'
  onOpen: () => void
  onViewInElements: () => void
}

function ProductCard({ product, badgeTone, onOpen, onViewInElements }: ProductCardProps) {
  const { addItem } = useCart()
  const viewInElements = (e: React.MouseEvent) => {
    e.stopPropagation()
    onViewInElements()
  }
  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: product.id, code: product.code, name: product.name,
      price: product.price, currency: product.currency, image: product.image ?? '',
    })
  }

  return (
    <div className="card card-hover group h-full overflow-hidden">
      {/* Main hit-area: image + caption open the product detail */}
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="relative overflow-hidden bg-paper-2">
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} — ${product.colorway}`}
              loading="lazy"
              decoding="async"
              className="media-zoom w-full object-cover motion-reduce:transition-none"
              style={{ aspectRatio: '4/5' }}
            />
          ) : (
            <AssetPlate label={`${product.code} / FRONT`} ratio="4/5" tone="paper" className="w-full" />
          )}

          {badgeTone !== 'none' && product.badge && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-medium ${
                badgeTone === 'signal'
                  ? 'bg-signal text-white'
                  : 'bg-paper/90 text-ink backdrop-blur-sm'
              }`}
            >
              {product.badge === 'LAST PIECE' ? 'Last piece' : 'New'}
            </span>
          )}

          {/* Quick add */}
          <span
            role="button"
            tabIndex={0}
            aria-label={`Add ${product.name} to bag`}
            onClick={quickAdd}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                quickAdd(e as unknown as React.MouseEvent)
              }
            }}
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-paper/95 text-lg font-light leading-none text-ink shadow-card transition-all duration-200 hover:bg-accent hover:text-white focus-visible:opacity-100 focus-visible:outline-accent md:opacity-0 md:group-hover:opacity-100"
          >
            +
          </span>
        </div>

        {/* Caption */}
        <div className="px-5 pb-1 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[1.02rem] text-ink">{product.name}</h2>
            <span className="shrink-0 text-[0.95rem] font-medium text-ink">
              {formatPrice(product)}
            </span>
          </div>
          <p className="mt-1 font-mono text-[0.72rem] text-mute">
            {product.code} · {product.colorway}
          </p>
        </div>
      </button>

      <div className="px-5 pb-5 pt-3">
        <button
          type="button"
          onClick={viewInElements}
          className="text-[0.85rem] text-accent transition-colors hover:text-accent-deep focus-visible:outline-accent"
        >
          View in the elements →
        </button>
      </div>
    </div>
  )
}
