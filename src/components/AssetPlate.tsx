// FILE: src/components/AssetPlate.tsx
// Tier-2 editorial plate placeholder (skill: placeholder).
// The honest stand-in for garment/editorial imagery that does not exist as a photo.
// NOT a broken image, NOT a fake photo — a branded SVG plate in house grammar.

export interface AssetPlateProps {
  /** Tech-pack label, e.g. "A41-S-002 / FRONT". */
  label: string
  /** Aspect ratio as a CSS ratio string, e.g. "4/5", "3/4", "16/9". */
  ratio?: string
  /** Surface tone — "paper" (default) for editorial, "ink" for GHOST contexts. */
  tone?: 'paper' | 'ink'
  /** Tailwind class passthrough for the wrapper (sizing/layout). */
  className?: string
}

/**
 * Renders a borderless large image container (image bleeds to cell edge) with
 * a faint diagonal hairline cross, a centered JetBrains Mono label, and the
 * "BUDDINGTON / PLATE" micro tag bottom-right. Fills its cell, accessible.
 */
export function AssetPlate({
  label,
  ratio = '4/5',
  tone = 'paper',
  className = '',
}: AssetPlateProps) {
  const isPaper = tone === 'paper'
  const surface = isPaper ? 'bg-paper-2' : 'bg-dark-card border border-white/10'
  const labelColor = isPaper ? 'text-mute' : 'text-paper/70'
  const tagColor   = isPaper ? 'text-mute/70' : 'text-accent/70'
  const crossStroke = isPaper ? '#d7dae0' : '#4d6bfe'

  return (
    <div
      className={`relative overflow-hidden ${surface} ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Placeholder plate: ${label}`}
    >
      {/* Faint diagonal hairline cross, corner to corner */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke={crossStroke} strokeWidth="0.3" opacity="0.5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke={crossStroke} strokeWidth="0.3" opacity="0.5" />
      </svg>

      {/* Centered label */}
      <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
        <span
          className={`font-mono ${labelColor}`}
          style={{ fontSize: '0.72rem' }}
        >
          {label}
        </span>
      </div>

      {/* Bottom-right micro tag */}
      <span
        className={`absolute bottom-2 right-2 font-mono ${tagColor}`}
        style={{ fontSize: '0.58rem' }}
      >
        Buddington / plate
      </span>
    </div>
  )
}