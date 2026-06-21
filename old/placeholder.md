# SKILL: placeholder — <AssetPlate/> (Tier 2)

The honest stand-in for editorial/garment imagery that doesn't exist as a photo. NOT a broken
image, NOT a fake photo — a branded SVG plate that looks intentional in the house grammar.

## Component (create at src/components/AssetPlate.tsx if absent)
Props: label: string (e.g. "A41-S-002 / FRONT"), ratio?: string (default "4/5"),
       tone?: "paper" | "ink" (default "paper").
Render a div with aspect-ratio = ratio:
- paper tone: bg #e9e3d7, 1px #d4cdbd border.
- ink tone:   bg #16150f, 1px #927327 border (for GHOST contexts).
- A faint diagonal hairline cross (SVG, stroke #d4cdbd) corner to corner.
- Centered JetBrains Mono label, 0.7rem, uppercase, 0.14em tracking, #6c685f.
- Bottom-right micro mono tag "BUDDINGTON / PLATE".
Must be responsive, object-cover-equivalent (fills its cell), and accessible (role="img",
aria-label = label).

## Use
Anywhere a product/hero photo is wanted but the file is absent. Then ADD that need to the
task's MISSING ASSETS list with the exact slot, e.g.:
  MISSING ASSETS:
  - Hero photo (home) — wants public/img/hero-a41.jpg (1600x900) — using AssetPlate for now.
  - Cotton Wreath Sweatsuit front — public/img/a41-s-002-front.jpg — AssetPlate for now.

This gives the human an exact shopping list of what to shoot/generate/upload, instead of you
guessing paths.
