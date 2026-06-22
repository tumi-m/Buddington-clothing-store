// FILE: src/components/GarmentStrip.tsx
// Touch-swipeable carousel of the 3D-rendered (background-removed) garments for
// the experience overlay. Each chip shows the live cutout render — no text — so
// it reads as a strip of floating clothing items (reference: yeezy.com). Works
// on mobile/tablet (horizontal swipe + scroll-snap) and desktop (click / the
// side toggles). The active chip auto-centres.

import { useEffect, useRef, useState } from 'react'
import type { Garment } from '../data/garments'
import { loadCutoutURL } from '../lib/cutout'

interface GarmentStripProps {
  garments: Garment[]
  selectedId: string
  onSelect: (id: string) => void
}

export function GarmentStrip({ garments, selectedId, onSelect }: GarmentStripProps) {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const activeRef = useRef<HTMLButtonElement>(null)

  // Build the cutout thumbnails once (cached across mounts).
  useEffect(() => {
    let cancelled = false
    garments.forEach(g => {
      loadCutoutURL(g.image).then(url => {
        if (!cancelled) setUrls(prev => (prev[g.id] ? prev : { ...prev, [g.id]: url }))
      })
    })
    return () => { cancelled = true }
  }, [garments])

  // Keep the selected chip centred as it changes.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedId])

  return (
    <div
      className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory overscroll-x-contain"
      role="listbox"
      aria-label="Garment carousel"
    >
      {/* Side spacers (width-relative) let the first / last item reach the centre. */}
      <div className="flex items-center gap-2.5 sm:gap-3 px-[45%] py-1">
        {garments.map(g => {
          const active = g.id === selectedId
          const url = urls[g.id] ?? g.image
          return (
            <button
              key={g.id}
              ref={active ? activeRef : undefined}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={`Select ${g.code}`}
              onClick={() => onSelect(g.id)}
              className={`snap-center shrink-0 rounded-lg p-1.5 border backdrop-blur-sm transition-all duration-300 focus-visible:outline-gold ${
                active
                  ? 'border-gold bg-white/[0.12] scale-105'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                className={`w-12 h-16 sm:w-16 sm:h-20 object-contain transition-opacity duration-300 ${
                  active ? 'opacity-100' : 'opacity-55'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
