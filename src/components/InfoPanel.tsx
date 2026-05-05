interface InfoPanelProps {
  onClose: () => void
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-black/85 backdrop-blur-xl border border-white/10 rounded-sm p-8 max-w-lg w-full mx-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs tracking-widest text-gold mb-1">TECHNOLOGY</div>
            <h2 className="text-xl font-display tracking-widest text-white">HOW IT WORKS</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white text-lg transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tech stack */}
        <div className="space-y-4 mb-6">
          <TechItem
            label="Cloth Physics"
            detail="Verlet integration with ~13,700 spring constraints (structural, shear, bend). 8 Jakobsen constraint passes per frame. 600 particles in a 30×20 grid."
            color="text-blue-400"
          />
          <TechItem
            label="Fabric Material"
            detail="Three.js MeshPhysicalMaterial with fabric sheen (anisotropic gold highlight), metalness, and environment map — recreates satin/silk light behaviour."
            color="text-purple-400"
          />
          <TechItem
            label="Store Texture"
            detail="The Buddington store UI is drawn directly to an HTML Canvas 2D context and uploaded as a CanvasTexture each frame. Zero external dependencies."
            color="text-gold"
          />
          <TechItem
            label="Experimental: HTML-in-Canvas"
            detail="Chrome's WICG proposal (canvas-draw-element flag) would allow drawElementImage() to paint live DOM directly as a GPU texture — making every hover, animation, and button fully interactive on the cloth."
            color="text-green-400"
          />
          <TechItem
            label="Post-processing"
            detail="@react-three/postprocessing: Bloom (luminance threshold 0.28), Chromatic Aberration (0.4px), and Vignette for a cinematic dark-room feel."
            color="text-red-400"
          />
        </div>

        {/* Chrome flag instructions */}
        <div className="bg-white/5 border border-white/8 rounded p-4 mb-6">
          <div className="text-xs tracking-widest text-gold mb-2">ENABLE EXPERIMENTAL HTML TEXTURE</div>
          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
            <li>Open Chrome and navigate to <code className="text-green-400">chrome://flags</code></li>
            <li>Search for <code className="text-green-400">canvas-draw-element</code></li>
            <li>Set to <strong className="text-white">Enabled</strong> and relaunch</li>
            <li>Return here — the cloth will render live interactive DOM</li>
          </ol>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-2">
          {['React 18', 'Three.js r167', 'R3F 8', 'Drei 9', 'Postprocessing', 'Vite 5', 'TypeScript', 'Tailwind'].map(t => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 border border-white/10 text-gray-500 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TechItem({ label, detail, color }: { label: string; detail: string; color: string }) {
  return (
    <div className="flex gap-3">
      <div className={`text-xs font-semibold tracking-wider whitespace-nowrap pt-0.5 ${color} min-w-[110px]`}>
        {label}
      </div>
      <div className="text-xs text-gray-500 leading-relaxed">{detail}</div>
    </div>
  )
}
