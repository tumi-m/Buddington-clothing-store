// FILE: src/components/FolioFooter.tsx
// Page footer: [EST. CAPE TOWN MCMLXXXIV] —— [BUDDINGTON / A41] —— [バディントン].
// House grammar (AGENTS.md). tone="ink" for the GHOST screen.

export interface FolioFooterProps {
  tone?: 'paper' | 'ink'
}

export function FolioFooter({ tone = 'paper' }: FolioFooterProps) {
  const ink = tone === 'ink'
  const txt = ink ? 'text-gold/70' : 'text-mute'
  const rule = ink ? 'border-gold/20' : 'border-hair'
  return (
    <footer className={`mx-auto max-w-[1600px] px-6 lg:px-12 mt-16 border-t ${rule}`}>
      <div className={`flex items-center justify-between py-5 font-mono uppercase text-[0.62rem] tracking-[0.14em] ${txt}`}>
        <span>EST. CAPE TOWN MCMLXXXIV</span>
        <span className="hidden sm:inline">BUDDINGTON / A41</span>
        <span className="font-jp normal-case">バディントン</span>
      </div>
    </footer>
  )
}