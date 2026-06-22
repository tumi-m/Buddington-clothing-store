// FILE: src/components/CartDrawer.tsx
// Global bag drawer + checkout flow. Rendered once at the app root so it floats
// above every view (editorial screens and the 3D experience). House grammar:
// paper ground, ink type, JetBrains Mono labels, 1px hair rules, gold accents.
// Checkout is a self-contained mock (no payment backend) — it validates the
// form, then clears the bag and shows a confirmation.

import { useEffect, useState } from 'react'
import { useCart, formatMoney } from '../cart/CartContext'

type Stage = 'bag' | 'checkout' | 'done'

export function CartDrawer() {
  const { items, count, subtotal, isOpen, close, setQty, removeItem, clear } = useCart()
  const [stage, setStage] = useState<Stage>('bag')

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
      className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute top-0 right-0 h-full w-[min(92vw,440px)] bg-paper text-ink flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-hair shrink-0">
          <span className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-ink">
            {stage === 'checkout' ? 'CHECKOUT' : stage === 'done' ? 'ORDER PLACED' : `BAG · ${count}`}
          </span>
          <button
            onClick={handleClose}
            aria-label="Close bag"
            className="font-mono text-lg leading-none text-mute hover:text-ink transition-colors focus-visible:outline-gold"
          >
            ✕
          </button>
        </div>

        {stage === 'bag' && (
          <BagStage
            items={items}
            subtotal={subtotal}
            setQty={setQty}
            removeItem={removeItem}
            onCheckout={() => setStage('checkout')}
          />
        )}

        {stage === 'checkout' && (
          <CheckoutStage
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
  setQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  onCheckout: () => void
}

function BagStage({ items, subtotal, setQty, removeItem, onCheckout }: BagStageProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-3">
        <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold">A41 / EMPTY</p>
        <p className="font-serif text-ink" style={{ fontSize: '1.4rem' }}>Your bag is empty.</p>
        <p className="font-mono text-mute text-[0.72rem] tracking-wide">Add a piece to begin.</p>
      </div>
    )
  }

  const currency = items[0]?.currency ?? '£'

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
        {items.map(item => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-20 shrink-0 overflow-hidden bg-paper-2">
              <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono uppercase text-[0.6rem] tracking-[0.14em] text-gold">{item.code}</p>
              <p className="font-serif text-ink leading-tight truncate" style={{ fontSize: '1rem' }}>{item.name}</p>
              <p className="font-mono text-mute text-[0.72rem] mt-0.5">{formatMoney(item.price, item.currency)}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-hair">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 flex items-center justify-center text-mute hover:text-ink transition-colors focus-visible:outline-gold"
                  >−</button>
                  <span className="w-7 text-center font-mono text-[0.72rem] text-ink">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    aria-label="Increase quantity"
                    className="w-7 h-7 flex items-center justify-center text-mute hover:text-ink transition-colors focus-visible:outline-gold"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-mono uppercase text-[0.6rem] tracking-[0.14em] text-mute hover:text-signal transition-colors focus-visible:outline-gold"
                >REMOVE</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-hair px-6 py-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-mute">Subtotal</span>
          <span className="font-mono text-ink text-[0.95rem]">{formatMoney(subtotal, currency)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full h-12 bg-ink text-paper font-mono uppercase text-[0.72rem] tracking-[0.14em] hover:bg-gold hover:text-ink transition-colors focus-visible:outline-gold"
        >
          CHECKOUT
        </button>
        <p className="font-mono text-mute text-[0.6rem] tracking-wide text-center mt-3">
          Taxes & shipping calculated at checkout
        </p>
      </div>
    </>
  )
}

// ── Checkout ─────────────────────────────────────────────────────────────────
function CheckoutStage({ subtotal, onBack, onPlaced }: { subtotal: number; onBack: () => void; onPlaced: () => void }) {
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Mock payment — no backend. Brief delay reads as processing.
    window.setTimeout(() => { setSubmitting(false); onPlaced() }, 900)
  }

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <Fieldset legend="CONTACT">
          <Field label="Email" type="email" name="email" autoComplete="email" required />
        </Fieldset>

        <Fieldset legend="SHIPPING">
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

        <Fieldset legend="PAYMENT">
          <Field label="Card number" name="card" inputMode="numeric" placeholder="•••• •••• •••• ••••" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry" name="exp" placeholder="MM / YY" required />
            <Field label="CVC" name="cvc" inputMode="numeric" placeholder="•••" required />
          </div>
        </Fieldset>
      </div>

      <div className="border-t border-hair px-6 py-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-mute">Total</span>
          <span className="font-mono text-ink text-[0.95rem]">{formatMoney(subtotal)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-ink text-paper font-mono uppercase text-[0.72rem] tracking-[0.14em] hover:bg-gold hover:text-ink transition-colors disabled:opacity-60 focus-visible:outline-gold"
        >
          {submitting ? 'PROCESSING…' : `PAY ${formatMoney(subtotal)}`}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full mt-3 font-mono uppercase text-[0.65rem] tracking-[0.14em] text-mute hover:text-ink transition-colors focus-visible:outline-gold"
        >
          ← BACK TO BAG
        </button>
      </div>
    </form>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-mono uppercase text-[0.62rem] tracking-[0.14em] text-gold mb-1">{legend}</legend>
      {children}
    </fieldset>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono uppercase text-[0.58rem] tracking-[0.14em] text-mute">{label}</span>
      <input
        {...props}
        className="h-10 px-3 bg-transparent border border-hair text-ink font-mono text-[0.78rem] placeholder:text-mute/60 focus:border-gold focus:outline-none transition-colors"
      />
    </label>
  )
}

// ── Confirmation ─────────────────────────────────────────────────────────────
function DoneStage({ onClose }: { onClose: () => void }) {
  const ref = (Math.floor(Math.random() * 9000) + 1000).toString()
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <p className="font-mono uppercase text-[0.7rem] tracking-[0.14em] text-gold">A41 / CONFIRMED</p>
      <p className="font-serif text-ink" style={{ fontSize: '1.7rem' }}>Thank you.</p>
      <p className="font-mono text-mute text-[0.72rem] tracking-wide leading-relaxed max-w-[16rem]">
        Your order <span className="text-ink">#BDG-{ref}</span> has been placed. A confirmation has been sent to your email.
      </p>
      <button
        onClick={onClose}
        className="mt-2 font-mono uppercase text-[0.7rem] tracking-[0.14em] text-ink border-b border-ink hover:text-gold hover:border-gold transition-colors pb-1 focus-visible:outline-gold"
      >
        CONTINUE →
      </button>
    </div>
  )
}
