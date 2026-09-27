// FILE: src/cart/CartContext.tsx
// Global bag / cart state for the whole site (editorial screens + the 3D
// experience). A single provider wraps the app so "add to cart" and checkout
// are reachable from every view (no router — house grammar). Persists to
// localStorage so the bag survives a reload.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  id: string
  code: string
  name: string
  /** Numeric unit price, for subtotal maths. */
  price: number
  currency: string
  image: string
  qty: number
  /** Chosen size. One product in two sizes is two bag lines. */
  size?: string
}

/**
 * Identity of a bag line. Size is part of it: adding an M and an L of the same
 * coat must produce two lines, not silently bump one quantity. Every mutation
 * addresses a line by this key rather than by product id.
 */
export function lineKey(item: Pick<CartItem, 'id' | 'size'>): string {
  return `${item.id}::${item.size ?? ''}`
}

export interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  /** The most recent addition, for the confirmation toast. */
  justAdded: CartItem | null
  dismissJustAdded: () => void
  open: () => void
  close: () => void
  toggle: () => void
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem: (key: string) => void
  setQty: (key: string, qty: number) => void
  /** Assign a size to a line added without one (quick-add). Merges if a line
   *  for that product/size already exists. */
  setSize: (key: string, size: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'buddington-bag'

/**
 * Coerce one stored row into a valid CartItem, or reject it.
 *
 * Stored bags outlive the code that wrote them: a row saved by an older build
 * (or hand-edited, or half-written) can be missing `price`/`qty`. Those used to
 * flow straight into `price.toLocaleString()` and throw during render, which
 * took down the whole app on every load until the user cleared site data.
 * Anything that cannot be repaired is dropped instead.
 */
function parseItem(raw: unknown): CartItem | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const price = Number(r.price)
  const qty = Math.floor(Number(r.qty))
  if (typeof r.id !== 'string' || r.id === '') return null
  if (!Number.isFinite(price) || price < 0) return null
  if (!Number.isFinite(qty) || qty < 1) return null
  return {
    id: r.id,
    code: typeof r.code === 'string' ? r.code : '',
    name: typeof r.name === 'string' ? r.name : 'Unknown piece',
    price,
    currency: typeof r.currency === 'string' && r.currency ? r.currency : '£',
    image: typeof r.image === 'string' ? r.image : '',
    qty,
    size: typeof r.size === 'string' && r.size ? r.size : undefined,
  }
}

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(parseItem).filter((i): i is CartItem => i !== null)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial)
  const [isOpen, setIsOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<CartItem | null>(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* quota / private mode */ }
  }, [items])

  // The confirmation toast retires itself.
  useEffect(() => {
    if (!justAdded) return
    const id = window.setTimeout(() => setJustAdded(null), 4000)
    return () => window.clearTimeout(id)
  }, [justAdded])

  const open   = useCallback(() => setIsOpen(true), [])
  const close  = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(o => !o), [])
  const dismissJustAdded = useCallback(() => setJustAdded(null), [])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    const key = lineKey(item)
    setItems(prev => {
      const existing = prev.find(i => lineKey(i) === key)
      if (existing) {
        return prev.map(i => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...item, qty }]
    })
    // Deliberately does NOT open the drawer: yanking a panel over the page on
    // every add interrupts browsing. The toast confirms it instead.
    setJustAdded({ ...item, qty })
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems(prev => prev.filter(i => lineKey(i) !== key))
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => lineKey(i) !== key)
        : prev.map(i => (lineKey(i) === key ? { ...i, qty } : i))
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const setSize = useCallback((key: string, size: string) => {
    setItems(prev => {
      const line = prev.find(i => lineKey(i) === key)
      if (!line) return prev
      const merged = lineKey({ id: line.id, size })
      const twin = prev.find(i => lineKey(i) === merged)
      if (twin) {
        // That size is already in the bag — fold the quantities together.
        return prev
          .filter(i => lineKey(i) !== key)
          .map(i => (lineKey(i) === merged ? { ...i, qty: i.qty + line.qty } : i))
      }
      return prev.map(i => (lineKey(i) === key ? { ...i, size } : i))
    })
  }, [])

  const count    = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])

  const value = useMemo<CartContextValue>(() => ({
    items, count, subtotal, isOpen, justAdded, dismissJustAdded,
    open, close, toggle, addItem, removeItem, setQty, setSize, clear,
  }), [items, count, subtotal, isOpen, justAdded, dismissJustAdded,
       open, close, toggle, addItem, removeItem, setQty, setSize, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

/** Shared currency formatter so every surface prints prices identically.
 *  Defensive about its input: a price is never worth crashing a render over. */
export function formatMoney(amount: number, currency = '£'): string {
  const n = Number(amount)
  return `${currency} ${(Number.isFinite(n) ? n : 0).toLocaleString('en-GB')}`
}
