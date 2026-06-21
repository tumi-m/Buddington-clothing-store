// FILE: src/data/products.ts
// Product model + seed data for the Buddington storefront.
//
// The repo previously had no product data — products were hardcoded literals
// inside the canvas-drawn store texture (useStoreTexture.ts). This file is the
// single source of truth for the editorial screens; the 3D texture keeps its
// own decorative copy.
//
// Real garment photographs of a fictional brand do not exist as dedicated
// product shots. However, the user directed that the six real photographs in
// public/images/ (originally slideshow art for the 3D cloth) be reused as the
// editorial product imagery in place of <AssetPlate/> placeholders. They are
// real existing files (image policy Tier 3, AGENTS.md), so `image` is now
// populated for every product. Back-of-garment shots still do not exist —
// ProductDetail keeps an <AssetPlate/> for the back plate (see MISSING ASSETS).

export type ProductCategory = 'outerwear' | 'tailoring' | 'knitwear' | 'trousers'

export interface Product {
  /** Stable id, kebab-case. */
  id: string
  /** Tech-pack style code, house grammar STYLE A41-X-000. */
  code: string
  name: string
  price: number
  currency: string
  category: ProductCategory
  /** Optional merchandising badge, e.g. "NEW", "LAST PIECE". */
  badge?: string
  colorway: string
  /** Short editorial line. */
  description: string
  /**
   * Real photographic path under /public (Tier 3). Leave undefined for garments
   * we have no photo for — the screen renders <AssetPlate/> instead.
   */
  image?: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'obsidian-coat',
    code: 'A41-S-002',
    name: 'Obsidian Coat',
    price: 890,
    currency: '£',
    category: 'outerwear',
    badge: 'NEW',
    colorway: 'Obsidian / Black',
    description: 'Weighted wool melton, blind-stitched hem. A coat that carries its own quiet mass.',
    image: '/images/IMG_5888.PNG',
  },
  {
    id: 'void-jacket',
    code: 'A41-S-014',
    name: 'Void Jacket',
    price: 650,
    currency: '£',
    category: 'outerwear',
    colorway: 'Soot / Char',
    description: 'Technical shell with taped seams and a dropped shoulder line.',
    image: '/images/IMG_6300.PNG',
  },
  {
    id: 'dusk-trousers',
    code: 'A41-S-031',
    name: 'Dusk Trousers',
    price: 390,
    currency: '£',
    category: 'trousers',
    badge: 'LAST PIECE',
    colorway: 'Dusk / Olive-black',
    description: 'High-rise, tapered leg. Side-release closure at the waist.',
    image: '/images/IMG_5912.PNG',
  },
  {
    id: 'ashford-blazer',
    code: 'A41-T-008',
    name: 'Ashford Blazer',
    price: 740,
    currency: '£',
    category: 'tailoring',
    colorway: 'Ash / Stone',
    description: 'Unstructured one-button silhouette in pressed mohair blend.',
    image: '/images/IMG_5821.jpg',
  },
  {
    id: 'monolith-knit',
    code: 'A41-K-005',
    name: 'Monolith Knit',
    price: 410,
    currency: '£',
    category: 'knitwear',
    badge: 'NEW',
    colorway: 'Monolith / Carbon',
    description: 'Heavy-gauge merino with a rolled crew neck.',
    image: '/images/IMG_5822.jpg',
  },
  {
    id: 'verge-overshirt',
    code: 'A41-S-022',
    name: 'Verge Overshirt',
    price: 480,
    currency: '£',
    category: 'outerwear',
    colorway: 'Verge / Slate',
    description: 'Boxy overshirt cut from waxed cotton, worn open or buttoned through.',
    image: '/images/IMG_5678.PNG',
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export function formatPrice(product: Product): string {
  return `${product.currency} ${product.price.toLocaleString('en-GB')}`
}