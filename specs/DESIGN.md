# specs/DESIGN.md — Buddington visual spec (text-only, for GLM-5.2)

## HOW THIS FILE IS PRODUCED
Claude Pro (multimodal) is the translator. Paste your real Buddington lookbook pages + GHOST
video stills into a Claude Pro chat with PROMPT 0 (in prompts/PROMPTS.md). Claude returns
text spec blocks — DOM, hex, rem, grid, type, motion — which you append below. GLM-5.2 then
builds from THIS file, never from images.

> NOTE: PROMPT 0 has NOT been run against real lookbook images. The screen specs below are a
> BEST-EFFORT derivation from the house baseline in AGENTS.md + the existing repo (single-page
> R3F cloth sim). Treat them as an implementable assumption, not a translation of real art.
> When Claude Pro output exists, replace each screen block with it.

## HOUSE BASELINE (already known — Claude need not re-derive)
Tokens (tailwind.config.ts): paper #f4f1ea · paper-2 #e9e3d7 · ink #16150f · mute #6c685f ·
hair #d4cdbd · gold #c9a44c · gold-dark #927327 · signal #b8332a (one per screen) ·
dark-bg #050505 / dark-card #0f0f0f (retained for the 3D cloth scene only).
Type: Cormorant Garamond (font-serif) display · JetBrains Mono (font-mono) UI/labels/prices,
uppercase 0.14em · Noto Serif JP (font-jp) バディントン accents · Inter (font-sans) + Bebas
Neue (font-display) retained for the legacy 3D overlay.
Layout: heavy negative space · 1px hair rules (border-hair / bg-hair) · BORDERLESS large image
containers (image bleeds to cell edge) · stark mono overlays · tech-pack numbering STYLE
A41-X-000 · folio footer [BUDDINGTON / A41] —— [roman numeral] —— [SECTION] + バディントン
bottom-right.
Motion: reveal 600ms cubic-bezier(0.16,1,0.3,1); hover scale 1→1.05; respect
prefers-reduced-motion (freeze GHOST pattern animation).
Routing: NO router — single-page view-state switch (useState) over screens:
`home | shop | product | ghost`. AGENTS.md forbids swapping the router.

## SCREEN SPECS  (best-effort until Claude Pro translation is provided)

### Home
- DOM: `<section home>` full-viewport, `bg-paper` ground, `hero-grain.svg` overlay at 6%
  (`background-image:url('/generated/hero-grain.svg')`, mix-blend-multiply). Grid: 12-col,
  gap 1.5rem, outer padding 2rem (mobile) / 4rem (≥1024px).
  - Top folio bar: JetBrains Mono 0.7rem uppercase 0.14em, text-mute — left `BUDDINGTON / A41`,
    center `—— I ——`, right `HOME`. 1px hair rule under it (bg-hair, h-px).
  - Eyebrow: JetBrains Mono 0.7rem uppercase, text-gold — `AUTUMN / WINTER 2041`.
  - H1 display: Cormorant Garamond 700, clamp(3rem→7rem), line-height 0.95, text-ink —
    `THE WEIGHT OF SILENCE`. Negative space: headline left-aligned, occupies ~7 cols, right
    5 cols empty (or a single tall AssetPlate, ratio 4/5, label `A41 / HERO`, tone ink).
  - Lede: Cormorant Garamond 400, 1.25rem, text-mute, max-width 32rem — one sentence.
  - CTAs: two text links (no filled buttons). Primary `EXPLORE THE COLLECTION →` (text-ink,
    underline-offset 4px, border-b border-ink). Secondary `VIEW LOOKBOOK` (text-mute).
  - Footer folio: 1px hair rule, then row: left `EST. CAPE TOWN MCMLXXXIV` (mono, mute),
    center `BUDDINGTON / A41`, right `バディントン` (font-jp, mute).
- Motion: headline + lede reveal 600ms ease, staggered 120ms; CTAs fade-in at +240ms.
- Sacred Red: NONE on Home.
- Images: hero-grain.svg (generated). If a real hero photo is supplied, replace the right
  AssetPlate with `<img src=…>` borderless, object-cover. Until then → AssetPlate (MISSING).

### Shop / product grid
- DOM: `<section shop>` bg-paper. Sticky folio bar (same as Home, center `—— II ——`, right
  `SHOP`). Section label: JetBrains Mono uppercase text-gold `THE COLLECTION`.
  - Filter row (mono, mute): category chips — ALL · OUTERWEAR · TAILORING · KNITWEER ·
    TROUSERS. Active chip: text-ink, border-b border-gold. Inactive: text-mute.
  - Grid: `grid-cols-2` (mobile) → `grid-cols-3` (≥768px) → `grid-cols-4` (≥1280px), gap 2rem.
    Each card is a BORDERLESS large image container (image bleeds to cell edge, no card
    border, no shadow):
    - Media: AssetPlate ratio 4/5, label `<code> / FRONT`, tone paper — OR real `image`
      path object-cover. Badge (NEW / LAST PIECE): top-left, mono 0.6rem uppercase, on
      `bg-signal` (Sacred Red) for LAST PIECE only, else `bg-ink` text-paper. (Red ≤ once per
      screen: only the FIRST LAST PIECE card may carry signal; render subsequent LAST PIECE
      badges in ink. See note below.)
    - Below media (no card padding around image; text sits in a 1rem padded caption block):
      name (Cormorant 500, 1.1rem, text-ink), price (JetBrains Mono 0.85rem, text-gold),
      code (mono 0.65rem, text-mute).
  - Card hover: image scale 1→1.05 (600ms), caption slides up 4px. reduced-motion: no scale.
- Sacred Red: at most ONE `bg-signal` badge per screen (the first LAST PIECE). Name it.
- Images: all product fronts → AssetPlate until real photos exist (MISSING ASSETS).

### Product detail
- DOM: `<section product>` bg-paper, two-column `lg:grid-cols-2`, gap 4rem, padding 4rem.
  - Left: large image stack — front plate ratio 4/5 (AssetPlate label `<code> / FRONT`),
    back plate ratio 4/5 below (AssetPlate label `<code> / BACK`). Borderless, bleed to edge.
  - Right: folio bar center `—— III ——` right `PRODUCT`. Eyebrow mono text-gold `<code>`.
    H1 Cormorant 700 clamp(2rem→4rem) text-ink — product name. Price JetBrains Mono 1.5rem
    text-gold. Colorway line mono text-mute. Description Cormorant 400 1.15rem text-ink/85.
    1px hair rule. Add-to-cart: text-ink underline link `ADD TO BAG →` (no filled button).
    Accordion (hair rule dividers): COMPOSITION · CARE · SIZING (mono labels, body serif).
  - Back link: `← THE COLLECTION` mono text-mute, top-left.
- Sacred Red: NONE (no badges here; LAST PIECE status shown as mono text-mute only).
- Images: front + back → AssetPlate until real photos exist (MISSING ASSETS).

### GHOST capsule
- DOM: `<section ghost>` bg-ink (dark surface, gold accent). `ghost-voronoi.svg` as tiled
  background `url('/generated/ghost-voronoi.svg')`, opacity ~10%, slow CSS translate of the
  pattern (animation 24s linear) — frozen under prefers-reduced-motion.
  - Folio bar (light-on-dark): mono text-gold left `BUDDINGTON / GHOST`, center `—— IV ——`,
    right `GHOST` + `バディントン` (font-jp, text-gold/70).
  - Eyebrow mono uppercase text-gold `ANTI-COMPUTER-VISION · CAPSULE`.
  - H1 Cormorant 700 clamp(2.5rem→5.5rem) text-paper — `GHOST // A41`. One line of lede
    Cormorant 400 text-paper/70 max-width 30rem.
  - Three GHOST items in a row: each is a borderless ink card, AssetPlate ratio 1/1
    tone=ink, label `GHOST-0X / FRONT`, with `ghost-dazzle.svg` at 8% behind the plate.
    Mono captions: name + price in text-gold.
  - Honest framing line (mono 0.7rem text-mute): `GHOST IS AN AESTHETIC HOMAGE TO ADVERSARIAL
    FASHION — NOT A GUARANTEED CV DEFEAT.` (per asset-gen.md honesty rule).
- Sacred Red: NONE on GHOST (gold is the accent here).
- Images: ghost-voronoi.svg, ghost-dazzle.svg (generated). Item plates → AssetPlate tone=ink.

### Experience (3D cloth)
- DOM: `<div experience>` full-screen `bg-dark-bg`. R3F `<Canvas>` with cloth simulation + lush nature ground + weather/day-night.
- Overlay UI (`src/components/UI.tsx`):
  - Top-left: brand wordmark + legacy garment selector panel.
  - Top-right: COLLECTION / LOOKBOOK / STORES / SHOP nav.
  - Top-center: `← EXIT TO SITE`.
  - Bottom: **GarmentCarousel** — horizontal filmstrip with spring-physics drag, arrow buttons, keyboard navigation. Shows garment thumbnail (4/5), code, name, price; active item gets gold border.
  - Bottom-right: Quality toggle, Weather selector + Day/Night toggle, Wind slider + ON/OFF, TECH INFO toggle.
- Physics: cloth uses Verlet integration; switching garments applies a short ripple impulse to the cloth.
- Motion: carousel drag uses spring snap (600ms ease equivalent); reduced-motion disables momentum.
- Sacred Red: NONE on Experience (gold accent only).
- Images: garment thumbnails reuse existing `public/images/` photos.

## ASSET INVENTORY (filled during discovery + asset-gen)
Generated (code, in public/generated/ — run `node scripts/gen-assets.mjs`):
  ghost-voronoi.svg, ghost-dazzle.svg, ghost-noise.svg, hero-grain.svg, folio-rule.svg.

Existing photos in repo (public/images/ — slideshow art for the 3D cloth, NOT garment
product shots; not wired into the editorial screens):
  IMG_5678.PNG, IMG_5821.jpg, IMG_5822.jpg, IMG_5888.PNG, IMG_5912.PNG, IMG_6300.PNG.

Existing photos wired into the storefront:
  - Hero photo (home, right column): public/images/IMG_5678.PNG.
  - Product front plates (shop + detail): public/images/IMG_5678.PNG, IMG_5821.jpg, IMG_5822.jpg,
    IMG_5888.PNG, IMG_5912.PNG, IMG_6300.PNG.
  - GHOST item plates: public/images/IMG_5678.PNG, IMG_5888.PNG, IMG_5912.PNG.

Missing (the shopping list — filled per task via MISSING ASSETS):
  - Dedicated per-SKU product front shots (currently reusing the six existing photos; would prefer
    public/images/<id>-front.jpg 1200×1500, 4/5).
  - Product back plates (detail) — wants public/images/<id>-back.jpg — AssetPlate `<code> / BACK`.
  - GHOST item plates — wants dedicated public/images/ghost-0X.jpg (1200×1200, 1/1).
  - Carousel currently reuses the existing front photos for thumbnails.