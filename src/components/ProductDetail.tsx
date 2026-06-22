// FILE: src/components/ProductDetail.tsx
// Product detail (specs/DESIGN.md §Product detail). Sacred Red: none.
// Uses <details> for the spec accordion — accessible, no JS, keyboard-operable.

import type { Product } from '../data/products'
import { formatPrice } from '../data/products'
import { useCart } from '../cart/CartContext'
import { FolioBar } from './FolioBar'
import { FolioFooter } from './FolioFooter'
import { AssetPlate } from './AssetPlate'

export interface ProductDetailProps {
  product: Product
  onBack: () => void
  onViewInElements: (garmentId: string) => void
}

export function ProductDetail({ product, onBack, onViewInElements }: ProductDetailProps) {
  const { addItem } = useCart()
  const addToBag = () => addItem({
    id: product.id, code: product.code, name: product.name,
    price: product.price, currency: product.currency, image: product.image ?? '',
  })
  return (
    <>
      <FolioBar roman="III" section="PRODUCT" />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 py-8">
      <button
        onClick={onBack}
        className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-mute hover:text-ink transition-colors mb-8 focus-visible:outline-gold"
      >
        ← THE COLLECTION
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Left: image stack (front + back) — borderless, bleed to edge */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            {product.image ? (
              <img
                src={product.image}
                alt={`${product.name} — front`}
                loading="eager"
                decoding="sync"
                className="w-full object-cover"
                style={{ aspectRatio: '4/5' }}
              />
            ) : (
              <AssetPlate label={`${product.code} / FRONT`} ratio="4/5" tone="paper" className="w-full" />
            )}
            {/* Back plate — always AssetPlate until a back photo exists */}
            <AssetPlate label={`${product.code} / BACK`} ratio="4/5" tone="paper" className="w-full" />
          </div>

          {/* Right: details */}
          <div className="flex flex-col">
            <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold mb-3">
              {product.code}
            </p>
            <h1
              className="font-serif font-semibold text-ink leading-[1.02]"
              style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}
            >
              {product.name}
            </h1>
            <p className="font-mono text-gold mt-4" style={{ fontSize: '1.5rem' }}>
              {formatPrice(product)}
            </p>
            <p className="font-mono uppercase text-mute mt-3 tracking-[0.14em]" style={{ fontSize: '0.7rem' }}>
              {product.colorway}
            </p>

            <p className="font-serif text-ink/80 mt-6 max-w-[28rem] leading-relaxed" style={{ fontSize: '1.12rem' }}>
              {product.description}
            </p>

            {product.badge && (
              <p className="font-mono uppercase text-mute mt-4 tracking-[0.14em]" style={{ fontSize: '0.7rem' }}>
                {product.badge}
              </p>
            )}

            <hr className="border-hair my-7" />

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={addToBag}
                className="self-start font-mono uppercase text-[0.78rem] tracking-[0.14em] text-ink border-b border-ink hover:text-gold hover:border-gold transition-colors pb-1 focus-visible:outline-gold"
              >
                ADD TO BAG →
              </button>
              <button
                onClick={() => onViewInElements(product.id)}
                className="font-mono uppercase text-[0.78rem] tracking-[0.14em] text-mute hover:text-gold border-b border-transparent hover:border-gold transition-colors pb-1 focus-visible:outline-gold"
              >
                VIEW IN THE ELEMENTS →
              </button>
            </div>

            {/* Spec accordion — hair-rule dividers, accessible <details> */}
            <div className="mt-10 border-t border-hair">
              {SPECS.map(s => (
                <details key={s.label} className="group border-b border-hair">
                  <summary className="flex items-center justify-between py-3 cursor-pointer list-none focus-visible:outline-gold rounded-sm">
                    <span className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-ink">
                      {s.label}
                    </span>
                    <span className="font-mono text-mute group-open:rotate-45 transition-transform duration-300">
                      +
                    </span>
                  </summary>
                  <p className="font-serif text-mute pb-4 leading-relaxed" style={{ fontSize: '1rem' }}>
                    {s.body}
                  </p>
                </details>
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
  { label: 'COMPOSITION', body: 'Primary: virgin wool melton. Lining: cupro. Trim: rayon thread, blind-stitched.' },
  { label: 'CARE', body: 'Do not wash. Professional dry-clean only. Steam to refresh. Store on a broad hanger.' },
  { label: 'SIZING', body: 'Cut oversized. Model wears M (height 188cm). Drop shoulder; consult the Buddington size chart.' },
]