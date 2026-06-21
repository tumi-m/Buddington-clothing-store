# FEATURES.md — Buddington store QA tracker (canonical, single source of truth)

Status ∈ {todo, story-written, testing, error-found, fixing, fixed, verified}.
NEVER set `verified` without evidence (test pass / rendered route / observed result).

| id | feature | user_story | expected_behaviour | source_files | status | last_error | evidence |
|----|---------|-----------|--------------------|--------------|--------|-----------|----------|
| F01 | View-state shell | As a visitor, I move between Home/Shop/Product/GHOST/Experience without page reloads. | `useState<View>` in App switches views; no router; editorial shell scrolls, 3D view is fullscreen. | src/App.tsx, src/types.ts | story-written | | |
| F02 | Top nav | As a visitor, I click HOME/SHOP/GHOST/EXPERIENCE to switch views. | Nav buttons call onNavigate; active item gets gold underline + ink text; wordmark returns home. | src/components/Nav.tsx | story-written | | |
| F03 | 3D overlay nav live | As a visitor in the 3D experience, I click COLLECTION/LOOKBOOK/STORES/SHOP to leave it. | UI.tsx buttons call onNavigate (shop/ghost/home/shop); disabled gracefully if prop absent. | src/components/UI.tsx, src/App.tsx | story-written | | |
| F04 | Exit-to-site | As a visitor in the 3D experience, I click "← EXIT TO SITE" to return to the editorial site. | Button calls navigate('home'); overlay sits above canvas. | src/App.tsx | story-written | | |
| F05 | Folio chrome | As a visitor, I see a folio bar + footer in house grammar on every editorial screen. | FolioBar shows BUDDINGTON/A41 — roman — SECTION; FolioFooter shows EST/BUDDINGTON/A41/バディントン. | src/components/FolioBar.tsx, FolioFooter.tsx | story-written | | |
| F06 | Home hero | As a visitor, I see the editorial hero headline, lede, and CTAs. | Cormorant H1 "THE WEIGHT OF SILENCE", mono gold eyebrow, serif lede, two text-link CTAs, reveal animation. | src/components/Home.tsx | story-written | | |
| F07 | Home CTAs navigate | As a visitor, I click "EXPLORE THE COLLECTION →" and "VIEW LOOKBOOK". | First → shop; second → ghost. | src/components/Home.tsx | story-written | | |
| F08 | Home hero plate | As a visitor, I see a branded hero plate (no real photo yet). | AssetPlate label "A41 / HERO", ratio 4/5, tone ink. | src/components/Home.tsx, AssetPlate.tsx | story-written | | |
| F09 | Home grain ground | As a visitor, I see a subtle paper-grain texture behind the hero. | hero-grain.svg as background-image, blend multiply. | src/components/Home.tsx, public/generated/hero-grain.svg | story-written | | |
| F10 | Shop grid | As a shopper, I browse all products in a responsive grid. | Grid renders 6 PRODUCTS; 2 cols mobile → 3 md → 4 xl; borderless cards. | src/components/Shop.tsx, src/data/products.ts | story-written | | |
| F11 | Shop category filter | As a shopper, I filter the grid by category. | Chips ALL/outerwear/tailoring/knitwear/trousers filter PRODUCTS; active chip gold-underlined. | src/components/Shop.tsx | story-written | | |
| F12 | Shop card opens detail | As a shopper, I click a card to see the product. | Card button calls onOpenProduct(id) → view=product. | src/components/Shop.tsx, src/App.tsx | story-written | | |
| F13 | Shop card image fallback | As a shopper, I see a branded plate when a product photo is absent. | product.image undefined → AssetPlate "<code> / FRONT"; defined → <img> object-cover. | src/components/Shop.tsx, AssetPlate.tsx | story-written | | |
| F14 | Shop card hover | As a shopper, hovering a card scales its image. | transform scale 1→1.05 over 600ms ease; motion-reduce disables. | src/components/Shop.tsx | story-written | | |
| F15 | Shop badge + Sacred Red | As a shopper, I see NEW/LAST PIECE badges; red appears at most once. | First LAST PIECE badge bg-signal; all other badges bg-ink; redUsed guard. | src/components/Shop.tsx | story-written | | |
| F16 | Shop empty state | As a shopper, filtering to an empty category tells me and offers reset. | "NO PIECES…" + VIEW ALL button when shown.length===0. | src/components/Shop.tsx | story-written | | |
| F17 | Product detail | As a shopper, I read a product's full details. | Two-column: front/back plates, mono code, serif name, mono gold price, colorway, description. | src/components/ProductDetail.tsx | story-written | | |
| F18 | Product detail back link | As a shopper, I return to the grid from a product. | "← THE COLLECTION" calls onBack → view=shop. | src/components/ProductDetail.tsx, src/App.tsx | story-written | | |
| F19 | Spec accordion | As a shopper, I expand COMPOSITION/CARE/SIZING. | <details> elements, hair-rule dividers, + rotates 45° when open; keyboard operable. | src/components/ProductDetail.tsx | story-written | | |
| F20 | Add to bag | As a shopper, I see an ADD TO BAG affordance. | Text link "ADD TO BAG →" (no cart backend; no-op). | src/components/ProductDetail.tsx | story-written | | |
| F21 | Missing-product fallback | As a shopper, an invalid product id shows a graceful message. | MissingProduct renders "NOT FOUND" + back link. | src/App.tsx | story-written | | |
| F22 | GHOST dark surface | As a visitor, the GHOST screen is a dark surface with an animated adversarial background. | bg-ink, ghost-voronoi.svg tiled at 10% with 24s drift; frozen under reduced-motion. | src/components/GhostCapsule.tsx | story-written | | |
| F23 | GHOST items | As a visitor, I see three GHOST pieces with dazzle behind ink plates. | 3 ink cards, AssetPlate 1/1 tone ink, ghost-dazzle.svg 8% behind, mono name + gold price. | src/components/GhostCapsule.tsx | story-written | | |
| F24 | GHOST honesty line | As a visitor, I see an honest framing note about GHOST. | "GHOST IS AN AESTHETIC HOMAGE… NOT A GUARANTEED CV DEFEAT." | src/components/GhostCapsule.tsx | story-written | | |
| F25 | 3D cloth experience | As a visitor, the original 3D cloth sim still works. | Canvas+Scene render; wind slider + fan toggle affect cloth; hover ripples; click push; info panel. | src/App.tsx, src/components/Scene.tsx, UI.tsx, InfoPanel.tsx, hooks/* | story-written | | |
| F26 | House palette/fonts | As a visitor, the site uses the Buddington house grammar. | Tailwind tokens paper/ink/gold #c9a44c/etc; Cormorant/JetBrains Mono/Noto Serif JP loaded and applied. | tailwind.config.ts, index.html | story-written | | |
| F27 | Asset generation | As a dev, I can regenerate the code-drawn SVGs. | `node scripts/gen-assets.mjs` writes 5 SVGs to public/generated/. | scripts/gen-assets.mjs | story-written | | |
| F28 | AssetPlate spec | As a dev, placeholder plates follow the house placeholder grammar. | props label/ratio/tone; paper bg paper-2 + hair border, ink bg ink + gold-dark border; diagonal cross; mono label; BUDDINGTON/PLATE tag; role=img. | src/components/AssetPlate.tsx | story-written | | |
| F29 | Reveal motion + reduced-motion | As a visitor with reduced-motion preference, decorative motion freezes. | .reveal 600ms ease; @media reduced-motion disables reveal + ghost-drift; motion-reduce disables hover scale. | src/index.css, Shop.tsx | story-written | | |
| F30 | Focus visibility | As a keyboard visitor, focus is clearly indicated. | :focus-visible 2px gold ring, offset 2px. | src/index.css | story-written | | |
| F31 | Build green | As a dev, the project type-checks and builds. | `tsc --noEmit` exit 0; `vite build` exit 0. | tsconfig, package.json | story-written | | |

## Phase 1 summary
- 31 features enumerated from the code, each with a user story + expected behaviour.
- Status all `story-written`. No testing or fixing performed yet.
- Known pre-existing non-issue: vite warns the Three.js bundle chunk > 500 kB (cosmetic, unrelated to this upgrade).

## Next
Phase 2 (TEST & DOCUMENT): exercise each story, record actual vs expected, flag every error.
Type `continue` to proceed to Phase 2.