// FILE: src/components/CartDrawer.tsx
// Global bag drawer + checkout flow. Rendered once at the app root so it floats
// above every view (editorial screens and the 3D experience). Product-site
// grammar: white ground, rounded fields, one accent CTA.
// Checkout is a self-contained mock (no payment backend) — it validates the
// form, then clears the bag and shows a confirmation.

import { useEffect, useRef, useState } from 'react'
import { useCart, formatMoney, lineKey } from '../cart/CartContext'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { ApplePayButton } from './ApplePayButton'

type Stage = 'bag' | 'checkout' | 'done'

export function CartDrawer() {
  const { items, count, subtotal, isOpen, close, setQty, setSize, removeItem, clear } = useCart()
  const [stage, setStage] = useState<Stage>('bag')
  const panelRef = useRef<HTMLElement>(null)

  // Focus enters the panel on open, is trapped while open, and returns to the
  // control that opened it on close.
  useDialogFocus(panelRef, isOpen)

  // Reset to the bag stage whenever the drawer is reopened.
  useEffect(() => { if (isOpen) setStage(s => (s === 'done' ? 'done' : 'bag')) }, [isOpen])

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const handleClose = () => {
    close()
    // Allow the closing animation to finish before resetting a completed order.
    window.setTimeout(() => setStage('bag'), 300)
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? '' : 'invisible pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[3px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel. `invisible` on the wrapper (not just opacity) is what keeps the
          closed drawer's controls out of the keyboard tab order. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-[min(92vw,440px)] flex-col bg-paper text-ink shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-hair px-6">
          <span className="text-[0.95rem] font-medium text-ink">
            {stage === 'checkout' ? 'Checkout' : stage === 'done' ? 'Order placed' : `Bag · ${count}`}
          </span>
          <button
            onClick={handleClose}
            aria-label="Close bag"
            className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-mute transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>

        {stage === 'bag' && (
          <BagStage
            items={items}
            subtotal={subtotal}
            setQty={setQty}
            setSize={setSize}
            removeItem={removeItem}
            onCheckout={() => setStage('checkout')}
          />
        )}

        {stage === 'checkout' && (
          <CheckoutStage
            items={items}
            subtotal={subtotal}
            onBack={() => setStage('bag')}
            onPlaced={() => { clear(); setStage('done') }}
          />
        )}

        {stage === 'done' && <DoneStage onClose={handleClose} />}
      </aside>
    </div>
  )
}

// ── Bag ──────────────────────────────────────────────────────────────────────
interface BagStageProps {
  items: ReturnType<typeof useCart>['items']
  subtotal: number
  setQty: (key: string, qty: number) => void
  setSize: (key: string, size: string) => void
  removeItem: (key: string) => void
  onCheckout: () => void
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const

function BagStage({ items, subtotal, setQty, setSize, removeItem, onCheckout }: BagStageProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-paper-2 text-xl" aria-hidden="true">
          ⌀
        </div>
        <p className="text-[1.15rem] font-medium text-ink">Your bag is empty</p>
        <p className="text-[0.88rem] text-mute">Add a piece to begin.</p>
      </div>
    )
  }

  const currency = items[0]?.currency ?? '£'
  const unsized = items.filter(i => !i.size).length

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        {items.map((item, i) => {
          const key = lineKey(item)
          return (
          <div
            key={key}
            className="deal-in flex gap-4"
            style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }}
          >
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-paper-2">
              <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.98rem] font-medium leading-tight text-ink">{item.name}</p>
              <p className="mt-0.5 font-mono text-[0.68rem] text-mute">
                {item.code}{item.size ? ` · Size ${item.size}` : ''}
              </p>
              <p className="mt-1 text-[0.85rem] text-mute">{formatMoney(item.price, item.currency)}</p>

              {/* A line added by quick-add has no size yet. Ask here rather
                  than guessing one on the customer's behalf. */}
              {!item.size && (
                <div className="mt-2 rounded-lg bg-paper-2 p-2">
                  <p className="mb-1.5 text-[0.72rem] font-medium text-ink">Choose a size</p>
                  <div className="flex flex-wrap gap-1">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(key, s)}
                        aria-label={`Set size ${s} for ${item.name}`}
                        className="h-7 min-w-[2rem] rounded-full border border-hair bg-paper px-2 text-[0.72rem] text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-hair">
                  <button
                    onClick={() => setQty(key, item.qty - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-l-full text-mute transition-colors hover:text-ink focus-visible:outline-accent"
                  >−</button>
                  <span className="w-7 text-center font-mono text-[0.75rem] text-ink">{item.qty}</span>
                  <button
                    onClick={() => setQty(key, item.qty + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-r-full text-mute transition-colors hover:text-ink focus-visible:outline-accent"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(key)}
                  aria-label={`Remove ${item.name} from bag`}
                  className="text-[0.78rem] text-mute transition-colors hover:text-signal focus-visible:outline-accent"
                >Remove</button>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      <div className="shrink-0 border-t border-hair px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[0.9rem] text-mute">Subtotal</span>
          <span className="text-[1rem] font-medium text-ink">{formatMoney(subtotal, currency)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={unsized > 0}
          className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Checkout
        </button>
        <p className="mt-3 text-center text-[0.75rem] text-mute" role="status">
          {unsized > 0
            ? `Choose a size for ${unsized} item${unsized === 1 ? '' : 's'} to continue`
            : 'Taxes & shipping calculated at checkout'}
        </p>
      </div>
    </>
  )
}

// ── Checkout ─────────────────────────────────────────────────────────────────
interface CheckoutStageProps {
  items: ReturnType<typeof useCart>['items']
  subtotal: number
  onBack: () => void
  onPlaced: () => void
}

function CheckoutStage({ items, subtotal, onBack, onPlaced }: CheckoutStageProps) {
  const [submitting, setSubmitting] = useState(false)
  const currency = items[0]?.currency ?? '£'

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Mock payment — no backend. Brief delay reads as processing.
    window.setTimeout(() => { setSubmitting(false); onPlaced() }, 900)
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        {/* Express checkout. Renders only where Apple Pay genuinely works. */}
        <ApplePayButton items={items} subtotal={subtotal} currency={currency} onPaid={onPlaced} />

        {/* Said plainly, because a card form that looks real and takes nothing
            is worse than one that admits what it is. */}
        <p className="rounded-lg bg-paper-2 px-3 py-2 text-[0.74rem] leading-relaxed text-mute">
          Demonstration checkout: no card is charged and no details are sent anywhere.
        </p>

        <Fieldset legend="Contact">
          <Field label="Email" type="email" name="email" autoComplete="email" required />
        </Fieldset>

        <Fieldset legend="Shipping">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" name="first" autoComplete="given-name" required />
            <Field label="Last name" name="last" autoComplete="family-name" required />
          </div>
          <Field label="Address" name="address" autoComplete="street-address" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" name="city" autoComplete="address-level2" required />
            <Field label="Postcode" name="postcode" autoComplete="postal-code" required />
          </div>
        </Fieldset>

        <Fieldset legend="Payment">
          <Field label="Card number" name="card" inputMode="numeric" placeholder="•••• •••• •••• ••••" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry" name="exp" placeholder="MM / YY" required />
            <Field label="CVC" name="cvc" inputMode="numeric" placeholder="•••" required />
          </div>
        </Fieldset>
      </div>

      <div className="shrink-0 border-t border-hair px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[0.9rem] text-mute">Total</span>
          <span className="text-[1rem] font-medium text-ink">{formatMoney(subtotal)}</span>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-60">
          {submitting ? 'Processing…' : `Pay ${formatMoney(subtotal)}`}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 w-full text-[0.82rem] text-mute transition-colors hover:text-ink focus-visible:outline-accent"
        >
          ← Back to bag
        </button>
      </div>
    </form>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-[0.85rem] font-medium text-ink">{legend}</legend>
      {children}
    </fieldset>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.78rem] text-mute">{label}</span>
      <input
        {...props}
        className="h-11 rounded-lg border border-hair bg-paper px-3 text-[0.88rem] text-ink transition-colors placeholder:text-mute/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}

// ── Confirmation ─────────────────────────────────────────────────────────────
function DoneStage({ onClose }: { onClose: () => void }) {
  const ref = (Math.floor(Math.random() * 9000) + 1000).toString()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      {/* The tick draws itself rather than popping in — the one flourish the
          confirmation gets. */}
      <svg
        viewBox="0 0 48 48"
        className="h-14 w-14 text-accent"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="check-ring"
          cx="24" cy="24" r="21"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          opacity="0.35"
        />
        <path
          className="check-draw"
          d="M15 24.5 L21.5 31 L33 19"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      <p className="text-[1.5rem] font-medium text-ink">Thank you</p>
      <p className="max-w-[18rem] text-[0.88rem] leading-relaxed text-mute">
        Your order <span className="font-mono text-ink">#BDG-{ref}</span> has been placed.
        A confirmation has been sent to your email.
      </p>
      <button onClick={onClose} className="btn-primary mt-2">
        Continue
      </button>
    </div>
  )
}
