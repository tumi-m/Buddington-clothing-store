// FILE: src/components/GarmentCarousel.tsx
// Minimal image-only filmstrip for the wind-tunnel Experience. Spring-physics
// drag + snap, arrow buttons, keyboard navigation, reduced-motion support.
//
// Per direction: the carousel shows ONLY the garment render — no code, name,
// price or description (reference: yeezy.com). Selecting a thumbnail swaps the
// suspended piece in the 3D scene; all garment metadata lives in the scene, not
// here.

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
    minItemWidth: 96,
    initialIndex: Math.max(0, initialIndex),
    onChange: onIndexChange,
  })

  const activeId = garments[index]?.id ?? selectedGarment

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(86vw,640px)] select-none"
      {...bindKeyboard()}
    >
      <div className="relative px-8">
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Previous garment"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-paper/60 hover:text-gold transition-colors disabled:opacity-20 focus-visible:outline-gold"
        >
          ←
        </button>

        {/* Track viewport */}
        <div className="overflow-hidden" {...bindDrag()}>
          <div
            ref={trackRef}
            className="flex items-end touch-pan-y py-1"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {garments.map((g) => {
              const active = g.id === activeId
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGarmentChange(g.id)}
                  aria-label={`Select garment ${g.code}`}
                  aria-pressed={active}
                  className={`group shrink-0 w-[72px] sm:w-[84px] mr-3 last:mr-0 focus-visible:outline-gold ${
                    dragging ? 'pointer-events-none' : ''
                  }`}
                >
                  <div
                    className={`relative overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      active ? 'opacity-100 scale-105' : 'opacity-45 hover:opacity-80'
                    }`}
                    style={{ aspectRatio: '4 / 5' }}
                  >
                    <img
                      src={g.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Active marker — a single hairline of house gold */}
                  <div
                    className={`mx-auto mt-2 h-px transition-all duration-300 ${
                      active ? 'w-5 bg-gold' : 'w-5 bg-transparent'
                    }`}
                    aria-hidden="true"
                  />
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
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-paper/60 hover:text-gold transition-colors disabled:opacity-20 focus-visible:outline-gold"
        >
          →
        </button>
      </div>
    </div>
  )
}
