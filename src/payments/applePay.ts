// FILE: src/payments/applePay.ts
// Apple Pay via the Apple Pay JS API.
//
// What this does and does not do, plainly:
//  - The button only appears where Apple Pay genuinely exists (Safari on Apple
//    hardware) AND the store has merchant credentials configured server-side.
//    Everywhere else it is not rendered at all, so nobody is offered a payment
//    method that cannot complete.
//  - Merchant validation is done by the Netlify function, which holds the
//    Merchant Identity Certificate. It never touches the browser.
//  - Authorising the sheet yields a payment token. Charging that token needs a
//    payment processor (Stripe, Adyen, Braintree…). This storefront has none,
//    so `onAuthorized` receives the token and the caller decides what to do.
//    Nothing here claims money has moved.

export interface ApplePayLineItem {
  label: string
  amount: string
}

export interface ApplePayRequest {
  /** ISO 4217, e.g. "GBP". */
  currencyCode: string
  countryCode: string
  total: { label: string; amount: string }
  lineItems?: ApplePayLineItem[]
}

// ── Minimal ambient typing ────────────────────────────────────────────────
// The Apple Pay JS types are not in lib.dom, and only Safari defines the
// global. Declared narrowly: just the surface this module touches.
interface ApplePayValidateEvent { validationURL: string }
interface ApplePayAuthorizedEvent { payment: unknown }

interface ApplePaySessionInstance {
  onvalidatemerchant: ((e: ApplePayValidateEvent) => void) | null
  onpaymentauthorized: ((e: ApplePayAuthorizedEvent) => void) | null
  oncancel: (() => void) | null
  begin(): void
  abort(): void
  completeMerchantValidation(session: unknown): void
  completePayment(result: { status: number }): void
}

interface ApplePaySessionCtor {
  new (version: number, request: unknown): ApplePaySessionInstance
  canMakePayments(): boolean
  supportsVersion(version: number): boolean
  STATUS_SUCCESS: number
  STATUS_FAILURE: number
}

declare global {
  interface Window { ApplePaySession?: ApplePaySessionCtor }
}

const VERSION = 3
const MERCHANT_SESSION_ENDPOINT = '/.netlify/functions/apple-pay-merchant-session'

/** True when this browser can actually present an Apple Pay sheet. */
export function isApplePaySupported(): boolean {
  const S = window.ApplePaySession
  return Boolean(S && S.supportsVersion(VERSION) && S.canMakePayments())
}

/**
 * Ask the server whether Apple Pay credentials are configured. Combined with
 * `isApplePaySupported()`, this is what gates the button: a store without
 * credentials must not show a button that dead-ends at validation.
 */
export async function isApplePayConfigured(): Promise<boolean> {
  try {
    const res = await fetch(MERCHANT_SESSION_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // No validationURL: a probe. The endpoint answers `configured` either way.
      body: JSON.stringify({ probe: true }),
    })
    if (!res.ok) {
      // 400 means it IS configured and simply rejected the probe's missing URL.
      return res.status === 400
    }
    const data: unknown = await res.json()
    return Boolean(data && typeof data === 'object' && (data as { configured?: boolean }).configured)
  } catch {
    return false
  }
}

export interface StartApplePayOptions {
  request: ApplePayRequest
  /** Receives the authorised payment token. Resolve true only if it was
   *  genuinely accepted downstream — the sheet reports that to the shopper. */
  onAuthorized: (payment: unknown) => Promise<boolean>
  onCancel?: () => void
  onError?: (reason: string) => void
}

export function startApplePay({ request, onAuthorized, onCancel, onError }: StartApplePayOptions): void {
  const S = window.ApplePaySession
  if (!S) {
    onError?.('unsupported')
    return
  }

  const session = new S(VERSION, {
    countryCode: request.countryCode,
    currencyCode: request.currencyCode,
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    total: { label: request.total.label, amount: request.total.amount, type: 'final' },
    lineItems: request.lineItems,
    requiredBillingContactFields: ['postalAddress', 'name'],
    requiredShippingContactFields: ['postalAddress', 'name', 'email'],
  })

  session.onvalidatemerchant = async (event) => {
    try {
      const res = await fetch(MERCHANT_SESSION_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ validationURL: event.validationURL }),
      })
      const data = await res.json() as { configured?: boolean; session?: unknown; error?: string }
      if (!res.ok || !data.session) {
        session.abort()
        onError?.(data.error ?? 'validation-failed')
        return
      }
      session.completeMerchantValidation(data.session)
    } catch {
      session.abort()
      onError?.('validation-unreachable')
    }
  }

  session.onpaymentauthorized = async (event) => {
    let accepted = false
    try {
      accepted = await onAuthorized(event.payment)
    } catch {
      accepted = false
    }
    // Tell the sheet the truth — a green tick for a payment that did not go
    // through would be a lie told to the shopper at the worst moment.
    session.completePayment({ status: accepted ? S.STATUS_SUCCESS : S.STATUS_FAILURE })
    if (!accepted) onError?.('declined')
  }

  session.oncancel = () => onCancel?.()

  session.begin()
}
