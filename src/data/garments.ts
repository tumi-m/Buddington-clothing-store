// FILE: src/data/garments.ts
// Every piece of clothing on the site, selectable in the 3D experience so the
// visitor can see how each garment behaves against the weather + fan. Combines
// the six product SKUs (src/data/products.ts) with the three GHOST capsule
// pieces. GHOST reuses the photographic plates wired onto the storefront.

import { PRODUCTS } from './products'

export interface Garment {
  /** Stable id, kebab-case. Matches the product id or a GHOST-0X tag. */
  id: string
  name: string
  /** Tech-pack style code, house grammar. */
  code: string
  /** Display price in the 3D experience overlay. */
  price: string
  /** Real photographic path under /public (image policy Tier 3). */
  image: string
}

export const GARMENTS: Garment[] = [
  ...PRODUCTS.map(p => ({ id: p.id, name: p.name, code: p.code, price: `${p.currency} ${p.price.toLocaleString('en-GB')}`, image: p.image! })),
  { id: 'ghost-01', name: 'Spectre Shell',  code: 'GHOST-01', price: '£ 720', image: '/images/IMG_5678.PNG' },
  { id: 'ghost-02', name: 'Phantom Hood',   code: 'GHOST-02', price: '£ 540', image: '/images/IMG_5888.PNG' },
  { id: 'ghost-03', name: 'Wraith Trouser', code: 'GHOST-03', price: '£ 430', image: '/images/IMG_5912.PNG' },
]

export function getGarmentById(id: string): Garment | undefined {
  return GARMENTS.find(g => g.id === id)
}