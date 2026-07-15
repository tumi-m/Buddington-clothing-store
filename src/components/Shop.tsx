// FILE: src/components/Shop.tsx
// Shop / product grid (specs/DESIGN.md §Shop). Reads from src/data/products.ts.
// Sacred Red (#b8332a): AT MOST ONE per screen — used for the FIRST "LAST PIECE"
// badge only; subsequent LAST PIECE badges fall back to ink. Named below.

import { useState } from 'react'
import type { View } from '../types'
import { PRODUCTS, formatPrice, type Product, type ProductCategory } from '../data/products'
import { useCart } from '../cart/CartContext'
import { useReveal } from '../hooks/useReveal'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

type Filter = 'ALL' | ProductCategory

const FILTERS: Filter[] = ['ALL', 'outerwear', 'tailoring', 'knitwear', 'trousers']

export interface ShopProps {
  onOpenProduct: (id: string) => void
  onNavigate: (v: View) => void
  onViewInElements: (garmentId: string) => void
}

export function Shop({ onOpenProduct, onNavigate, onViewInElements }: ShopProps) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const reveal = useReveal()

  const shown = filter === 'ALL' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter)

  // Sacred-red budget: only the first LAST PIECE in the rendered set gets signal.
  let redUsed = false

  return (
    <>
      <FolioBar roman="II" section="SHOP" />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 py-14 lg:py-20">
        {/* Section label */}
        <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-2">
          THE COLLECTION
        </p>
        <h2 className="font-serif text-ink mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Autumn / Winter 2041
        </h2>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-5 mb-12 border-b border-hair pb-4">
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono uppercase text-[0.7rem] tracking-[0.14em] pb-1 transition-colors focus-visible:outline-gold ${
                  active
                    ? 'text-ink border-b border-gold'
                    : 'text-mute hover:text-ink border-b border-transparent'
                }`}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Grid — borderless large image containers, image bleeds to cell edge */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {shown.map((p, i) => {
            // The ONE allowed Sacred-Red badge on this screen:
            const isLastPiece = p.badge === 'LAST PIECE'
            const useRed = isLastPiece && !redUsed
            if (useRed) redUsed = true
            return (
              <div
                key={p.id}
                ref={reveal}
                className="reveal-scroll"
                style={{ transitionDelay: `${(i % 4) * 70}ms` }}
              >
                <ProductCard
                  product={p}
                  badgeTone={useRed ? 'signal' : isLastPiece ? 'ink' : p.badge ? 'ink' : 'none'}
                  onOpen={() => onOpenProduct(p.id)}
                  onViewInElements={() => onViewInElements(p.id)}
                />
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {shown.length === 0 && (
          <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-mute py-12">
            NO PIECES IN THIS CATEGORY ·{' '}
            <button onClick={() => setFilter('ALL')} className="underline text-ink focus-visible:outline-gold">
              VIEW ALL
            </button>
          </p>
        )}
      </section>

      <FolioFooter />
    </>
  )
}

interface ProductCardProps {
  product: Product
  badgeTone: 'signal' | 'ink' | 'none'
  onOpen: () => void
  onViewInElements: () => void
}

function ProductCard({ product, badgeTone, onOpen, onViewInElements }: ProductCardProps) {
  const { addItem } = useCart()
  const open = () => onOpen()
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
    <div className="group text-left">
      {/* Main card hit-area: image + caption open the product detail */}
      <button
        type="button"
        onClick={open}
        className="w-full text-left group/card"
      >
        {/* Borderless image container — image bleeds to cell edge */}
        <div className="relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} — ${product.colorway}`}
              loading="lazy"
              decoding="async"
              className="w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
              style={{ aspectRatio: '4/5' }}
            />
          ) : (
            <div className="transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
              <AssetPlate
                label={`${product.code} / FRONT`}
                ratio="4/5"
                tone="paper"
                className="w-full"
              />
            </div>
          )}

          {/* Badge — Sacred Red used here only when badgeTone === 'signal' */}
          {badgeTone !== 'none' && product.badge && (
            <span
              className={`absolute top-3 left-3 font-mono uppercase text-[0.6rem] tracking-[0.14em] px-2 py-1 ${
                badgeTone === 'signal' ? 'bg-signal text-paper' : 'bg-ink text-paper'
              }`}
            >
              {product.badge}
            </span>
          )}

          {/* Quick add — yeezy-style "+" on hover */}
          <span
            role="button"
            tabIndex={0}
            aria-label={`Add ${product.name} to bag`}
            onClick={quickAdd}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); quickAdd(e as unknown as React.MouseEvent) } }}
            className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center text-xl font-light leading-none bg-paper/90 text-ink rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-ink hover:text-paper transition-all duration-200 focus-visible:outline-gold focus-visible:opacity-100"
          >
            +
          </span>
        </div>

        {/* Caption block */}
        <div className="pt-4 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0">
          <h3 className="font-serif text-ink" style={{ fontSize: '1.1rem' }}>
            {product.name}
          </h3>
          <p className="font-mono text-gold mt-0.5" style={{ fontSize: '0.85rem' }}>
            {formatPrice(product)}
          </p>
          <p className="font-mono text-mute mt-0.5 uppercase tracking-[0.14em]" style={{ fontSize: '0.65rem' }}>
            {product.code}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={viewInElements}
        className="mt-3 font-mono uppercase text-[0.65rem] tracking-[0.14em] text-mute hover:text-gold border-b border-transparent hover:border-gold transition-colors pb-0.5 focus-visible:outline-gold"
      >
        VIEW IN THE ELEMENTS →
      </button>
    </div>
  )
}