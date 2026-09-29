// FILE: src/components/FolioFooter.tsx
// Page footer. Product-site grammar: a light band with the house line,
// establishment credit and the Japanese wordmark. tone="ink" for GHOST.

export interface FolioFooterProps {
  tone?: 'paper' | 'ink'
}

export function FolioFooter({ tone = 'paper' }: FolioFooterProps) {
  const ink = tone === 'ink'
  const wrap = ink ? 'border-white/10' : 'border-hair bg-paper-2'
  const txt = ink ? 'text-paper/55' : 'text-mute'
  const strong = ink ? 'text-paper/85' : 'text-ink'
  return (
    <footer className={`mt-20 border-t ${wrap}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[0.8rem] font-semibold text-white"
              aria-hidden="true"
            >
              B
            </span>
            <span className={`text-[0.95rem] font-semibold tracking-tight ${strong}`}>
              Buddington
            </span>
          </div>

          <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.82rem] ${txt}`}>
            <span>Est. Cape Town MCMLXXXIV</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Cape Town to Tokyo</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="font-jp">バディントン</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
