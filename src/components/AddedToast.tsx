// FILE: src/components/AddedToast.tsx
// Confirmation for "add to bag". Adding used to throw the whole drawer open
// over the page, which interrupts browsing; this says the same thing quietly
// and offers the drawer rather than forcing it.
//
// It is a polite live region so screen readers hear the confirmation without
// losing their place, and it retires itself after a few seconds
// (CartContext owns that timer).

import { useCart, formatMoney } from '../cart/CartContext'

export function AddedToast() {
  const { justAdded, dismissJustAdded, open } = useCart()

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all duration-300 ${
        justAdded ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-3 opacity-0'
      }`}
    >
      {justAdded && (
        <div className="card flex items-center gap-3 py-2 pl-2 pr-3 shadow-lift">
          {justAdded.image ? (
            <img
              src={justAdded.image}
              alt=""
              className="h-11 w-9 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid h-11 w-9 shrink-0 place-items-center rounded-md bg-paper-2 text-accent">✓</span>
          )}

          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-ink">
              Added {justAdded.name}
            </p>
            <p className="truncate text-[0.76rem] text-mute">
              {justAdded.size ? `Size ${justAdded.size} · ` : ''}
              {formatMoney(justAdded.price, justAdded.currency)}
            </p>
          </div>

          <button
            onClick={() => { dismissJustAdded(); open() }}
            className="btn-primary ml-1 shrink-0 px-4 py-1.5 text-[0.82rem]"
          >
            View bag
          </button>
          <button
            onClick={dismissJustAdded}
            aria-label="Dismiss"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
