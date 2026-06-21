# SKILL: asset-gen — generate imagery as code (Tier 1)

Use when the design needs decorative/brand imagery and no photo is required: GHOST adversarial
pattern tiles, hero background texture, section dividers, the folio rule, gradient grounds.

## Principle
You can't make pixels, but you CAN write SVG/CSS that renders as imagery in the browser.
Prefer inline SVG React components for one-offs; emit reusable tiles to public/generated/ for
backgrounds referenced by CSS url().

## scripts/gen-assets.mjs
A Node ESM script (no native deps) that writes SVG files into public/generated/. Run in the
Codespace terminal: `node scripts/gen-assets.mjs`. Generates:
- ghost-voronoi.svg     tonal Voronoi dazzle in near-black greys (CV-segmentation disruptor look)
- ghost-dazzle.svg      asymmetric high-contrast silhouette-breaking wedges
- ghost-noise.svg       hi-frequency interference bands (SVG feTurbulence)
- hero-grain.svg        subtle paper grain overlay (feTurbulence, low opacity)
- folio-rule.svg        1px hairline + roman-numeral-ready spacer
All use the house palette via SVG attributes. These are deterministic, license-free, yours.

## GHOST pattern as a React component (preferred for /ghost hero)
Render feTurbulence + feColorMatrix tinted to --ink/--gold at ~8–14% opacity behind content.
Animate with CSS (slow translate of a <pattern>) for the "alive" adversarial feel. Respect
prefers-reduced-motion: freeze the pattern.

## Rules
- Palette only (tokens in AGENTS.md). GHOST surfaces run dark (--ink ground, --gold accent).
- Keep tiles seamless (tileable) so CSS background-repeat doesn't seam.
- Honest framing: GHOST patterns are an aesthetic homage to adversarial fashion, not a
  guaranteed CV defeat — never claim they defeat real detectors.
