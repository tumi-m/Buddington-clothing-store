// FILE: src/components/ApplePayButton.tsx
// Apple Pay express checkout.
//
// Renders nothing unless BOTH are true: the browser can present an Apple Pay
// sheet, and the server reports merchant credentials are configured. A button
// that opens a sheet and then fails validation is worse than no button, so the
// gate is deliberately strict and the default is to stay hidden.

import { useEffect, useState } from 'react'
import { isApplePaySupported, isApplePayConfigured, startApplePay } from '../payments/applePay'
import { formatMoney } from '../cart/CartContext'
import type { CartItem } from '../cart/CartContext'

const CURRENCY_CODES: Record<string, string> = { '£': 'GBP', '$': 'USD', '€': 'EUR' }

/**
 * Capture the authorised token with a payment processor.
 * This storefront has no processor connected, so it always reports failure —
 * the one place to change when Stripe/Adyen/Braintree is wired in.
 */
async function capturePayment(): Promise<boolean> {
  return false
}

export interface ApplePayButtonProps {
  items: CartItem[]
  subtotal: number
  currency: string
  /** Called once the sheet reports a successful authorisation. */
  onPaid: () => void
}

export function ApplePayButton({ items, subtotal, currency, onPaid }: ApplePayButtonProps) {
  const [available, setAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!isApplePaySupported()) return
    isApplePayConfigured().then(ok => {
      if (!cancelled) setAvailable(ok)
    })
    return () => { cancelled = true }
  }, [])

  if (!available) return null

  const pay = () => {
    setError(null)
    startApplePay({
      request: {
        countryCode: 'GB',
        currencyCode: CURRENCY_CODES[currency] ?? 'GBP',
        total: { label: 'Buddington', amount: subtotal.toFixed(2) },
        lineItems: items.map(i => ({
          label: `${i.name}${i.size ? ` (${i.size})` : ''} × ${i.qty}`,
          amount: (i.price * i.qty).toFixed(2),
        })),
      },
      onAuthorized: async () => {
        // Where a payment processor would capture the token and report whether
        // the charge succeeded. None is wired up, so this reports failure
        // rather than showing a tick for money that never moved. When one is
        // connected, return its result and onPaid fires on success.
        const captured = await capturePayment()
        if (captured) onPaid()
        else setError('no-processor')
        return captured
      },
      onCancel: () => setError(null),
      onError: reason => setError(reason),
    })
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={pay}
        aria-label={`Pay ${formatMoney(subtotal, currency)} with Apple Pay`}
        className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-ink text-paper transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-accent"
      >
        <AppleMark />
        <span className="text-[1.02rem] font-medium tracking-tight">Pay</span>
      </button>

      {error && (
        <p role="alert" className="mt-2 text-center text-[0.76rem] text-mute">
          {error === 'no-processor'
            ? 'Apple Pay is configured, but no payment processor is connected yet.'
            : 'Apple Pay could not be completed. Use the card form below.'}
        </p>
      )}

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-hair" />
        <span className="text-[0.74rem] text-mute">or pay by card</span>
        <span className="h-px flex-1 bg-hair" />
      </div>
    </div>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 16 20" className="h-[1.15rem] w-[1.15rem]" fill="currentColor" aria-hidden="true">
      <path d="M13.24 10.62c-.02-2.18 1.78-3.23 1.86-3.28-1.01-1.48-2.59-1.69-3.15-1.71-1.34-.14-2.62.79-3.3.79-.68 0-1.73-.77-2.85-.75-1.46.02-2.82.85-3.57 2.16-1.53 2.65-.39 6.56 1.09 8.71.73 1.05 1.6 2.23 2.74 2.19 1.1-.04 1.51-.71 2.84-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5zM11.07 4.2c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.22z" />
    </svg>
  )
}
