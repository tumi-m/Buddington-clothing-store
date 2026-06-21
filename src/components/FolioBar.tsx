// FILE: src/components/FolioBar.tsx
// Thin folio rule under the nav: [BUDDINGTON / A41] —— [roman] —— [SECTION].
// House grammar (AGENTS.md). tone="ink" for the GHOST screen.

export interface FolioBarProps {
  roman: string
  section: string
  tone?: 'paper' | 'ink'
}

export function FolioBar({ roman, section, tone = 'paper' }: FolioBarProps) {
  const ink = tone === 'ink'
  const txt = ink ? 'text-gold/80' : 'text-mute'
  const rule = ink ? 'border-gold/20' : 'border-hair'
  return (
    <div className={`mx-auto max-w-[1600px] px-6 lg:px-12 border-b ${rule}`}>
      <div className={`flex items-center justify-between py-2 font-mono uppercase text-[0.62rem] tracking-[0.14em] ${txt}`}>
        <span>BUDDINGTON / A41</span>
        <span>—— {roman} ——</span>
        <span>{section}</span>
      </div>
    </div>
  )
}