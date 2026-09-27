// FILE: src/components/FolioBar.tsx
// Thin section rule under the nav: breadcrumb-style [Buddington / A41] · [SECTION].
// tone="ink" for the GHOST screen, which keeps a dark surface.

export interface FolioBarProps {
  roman: string
  section: string
  tone?: 'paper' | 'ink'
}

export function FolioBar({ roman, section, tone = 'paper' }: FolioBarProps) {
  const ink = tone === 'ink'
  const txt = ink ? 'text-paper/50' : 'text-mute'
  const strong = ink ? 'text-paper/80' : 'text-ink'
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <div className={`flex items-center gap-2 py-3 font-mono text-[0.68rem] ${txt}`}>
        <span>Buddington / A41</span>
        <span aria-hidden="true">·</span>
        <span>{roman}</span>
        <span aria-hidden="true">·</span>
        <span className={strong}>{section}</span>
      </div>
    </div>
  )
}
