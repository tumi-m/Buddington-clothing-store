// FILE: src/components/Shop.tsx
// Shop / product grid (specs/DESIGN.md §Shop). Reads from src/data/products.ts.
// Sacred Red (#b8332a): AT MOST ONE per screen — used for the FIRST "LAST PIECE"
// badge only; subsequent LAST PIECE badges fall back to ink. Named below.

import { useState } from 'react'
import type { View } from '../types'
import { PRODUCTS, formatPrice, type Product, type ProductCategory } from '../data/products'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

type Filter = 'ALL' | ProductCategory

const FILTERS: Filter[] = ['ALL', 'outerwear', 'tailoring', 'knitwear', 'trousers']

export interface ShopProps {
  onOpenProduct: (id: string) => void
  onNavigate: (v: View) => void
}

export function Shop({ onOpenProduct, onNavigate }: ShopProps) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const shown = filter === 'ALL' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter)

  // Sacred-red budget: only the first LAST PIECE in the rendered set gets signal.
  let redUsed = false

  return (
    <>
      <FolioBar roman="II" section="SHOP" />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 py-12">
        {/* Section label */}
        <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-2">
          THE COLLECTION
        </p>
        <h2 className="font-serif text-ink mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Autumn / Winter 2041
        </h2>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-5 mb-10 border-b border-hair pb-4">
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono uppercase text-[0.7rem] tracking-[0.14em] pb-1 transition-colors ${
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {shown.map(p => {
            // The ONE allowed Sacred-Red badge on this screen:
            const isLastPiece = p.badge === 'LAST PIECE'
            const useRed = isLastPiece && !redUsed
            if (useRed) redUsed = true
            return (
              <ProductCard
                key={p.id}
                product={p}
                badgeTone={useRed ? 'signal' : isLastPiece ? 'ink' : p.badge ? 'ink' : 'none'}
                onOpen={() => onOpenProduct(p.id)}
              />
            )
          })}
        </div>

        {/* Empty state */}
        {shown.length === 0 && (
          <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-mute py-12">
            NO PIECES IN THIS CATEGORY ·{' '}
            <button onClick={() => setFilter('ALL')} className="underline text-ink">
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
}

function ProductCard({ product, badgeTone, onOpen }: ProductCardProps) {
  return (
    <button onClick={onOpen} className="group text-left">
      {/* Borderless image container — image bleeds to cell edge */}
      <div className="relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} — ${product.colorway}`}
            className="w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
            style={{ aspectRatio: '4/5' }}
          />
        ) : (
          <div className="transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none">
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
      </div>

      {/* Caption block */}
      <div className="pt-3">
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
  )
}