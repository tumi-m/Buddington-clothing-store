// FILE: src/components/GarmentCarousel.tsx
// Bottom filmstrip carousel for the 3D Experience. Spring-physics drag + snap,
// arrow buttons, keyboard navigation, reduced-motion support.

import { useCallback } from 'react'
import type { Garment } from '../data/garments'
import { useSpringCarousel } from '../hooks/useSpringCarousel'

interface GarmentCarouselProps {
  garments: Garment[]
  selectedGarment: string
  onGarmentChange: (id: string) => void
}

export function GarmentCarousel({ garments, selectedGarment, onGarmentChange }: GarmentCarouselProps) {
  const onIndexChange = useCallback((i: number) => {
    const g = garments[i]
    if (g && g.id !== selectedGarment) onGarmentChange(g.id)
  }, [garments, selectedGarment, onGarmentChange])

  const initialIndex = garments.findIndex(g => g.id === selectedGarment)
  const { index, setIndex, trackRef, bindDrag, bindKeyboard, dragging } = useSpringCarousel({
    count: garments.length,
    minItemWidth: 160,
    initialIndex: Math.max(0, initialIndex),
    onChange: onIndexChange,
  })

  const activeId = garments[index]?.id ?? selectedGarment

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(90vw,920px)] select-none"
      {...bindKeyboard()}
    >
      {/* Glass panel */}
      <div
        className="relative bg-black/70 backdrop-blur-md border border-white/[0.08] rounded-sm px-10 py-3 shadow-2xl"
      >
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Previous garment"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gold hover:text-paper transition-colors disabled:opacity-30 focus-visible:outline-gold"
        >
          ←
        </button>

        {/* Track viewport */}
        <div className="overflow-hidden" {...bindDrag()}>
          <div
            ref={trackRef}
            className="flex touch-pan-y"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {garments.map((g) => {
              const active = g.id === activeId
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGarmentChange(g.id)}
                  aria-label={`Select ${g.name}`}
                  aria-pressed={active}
                  className={`shrink-0 w-[140px] sm:w-[160px] text-left mr-3 last:mr-0 p-2 rounded-sm border transition-colors focus-visible:outline-gold ${
                    active
                      ? 'border-gold bg-gold/10'
                      : 'border-transparent hover:border-white/[0.15] hover:bg-white/5'
                  } ${dragging ? 'pointer-events-none' : ''}`}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                    <img
                      src={g.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        active ? 'scale-100' : 'group-hover:scale-105'
                      }`}
                    />
                    {active && (
                      <div className="absolute inset-0 border border-gold pointer-events-none" aria-hidden="true" />
                    )}
                  </div>
                  <p className="font-mono uppercase text-[0.6rem] tracking-[0.14em] text-gold mt-2 truncate">
                    {g.code}
                  </p>
                  <p className="font-serif text-paper text-sm leading-tight truncate">
                    {g.name}
                  </p>
                  <p className="font-mono text-gold text-xs mt-0.5">{g.price}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Next garment"
          onClick={() => setIndex(Math.min(garments.length - 1, index + 1))}
          disabled={index === garments.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gold hover:text-paper transition-colors disabled:opacity-30 focus-visible:outline-gold"
        >
          →
        </button>
      </div>
    </div>
  )
}
