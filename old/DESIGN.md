# specs/DESIGN.md — Buddington visual spec (text-only, for GLM-5.2)

## HOW THIS FILE IS PRODUCED
Claude Pro (multimodal) is the translator. Paste your real Buddington lookbook pages + GHOST
video stills into a Claude Pro chat with PROMPT 0 (in prompts/PROMPTS.md). Claude returns
text spec blocks — DOM, hex, rem, grid, type, motion — which you append below. GLM-5.2 then
builds from THIS file, never from images.

## HOUSE BASELINE (already known — Claude need not re-derive)
Tokens: paper #f4f1ea · paper-2 #e9e3d7 · ink #16150f · mute #6c685f · hair #d4cdbd ·
gold #c9a44c · gold-deep #927327 · signal #b8332a (one per screen).
Type: Cormorant Garamond display · JetBrains Mono UI/labels/prices (uppercase 0.14em) ·
Noto Serif JP accents. Layout: negative space, 1px hair rules, borderless large image
containers, tech-pack numbering, folio footer.

## SCREEN SPECS  (Claude Pro appends translated blocks here, one per screen)
### Home
<paste translated DOM/hex/rem/grid/motion from the real hero + drop + GHOST teaser visuals>

### Shop / product grid
<paste>

### Product detail
<paste>

### GHOST capsule
<paste — note which generated tile backs the hero: /generated/ghost-voronoi.svg etc.>

## ASSET INVENTORY (filled during discovery + asset-gen)
Generated (code, in public/generated/): ghost-voronoi.svg, ghost-dazzle.svg, ghost-noise.svg,
hero-grain.svg, folio-rule.svg.
Existing photos in repo: <list after discovery>
Missing (the shopping list): <GLM fills via MISSING ASSETS each task>
