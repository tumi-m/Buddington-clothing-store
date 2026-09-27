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
}

export interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
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

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* quota / private mode */ }
  }, [items])

  const open   = useCallback(() => setIsOpen(true), [])
  const close  = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(o => !o), [])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...item, qty }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, qty } : i)
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count    = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])

  const value = useMemo<CartContextValue>(() => ({
    items, count, subtotal, isOpen, open, close, toggle,
    addItem, removeItem, setQty, clear,
  }), [items, count, subtotal, isOpen, open, close, toggle, addItem, removeItem, setQty, clear])

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
