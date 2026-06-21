# PROMPTS — Buddington store upgrade (Claude Pro translator + GLM-5.2 builder)

Pipeline: PROMPT 0 runs in CLAUDE PRO (it sees your images). PROMPTS 1–3 run in CLAUDE CODE
on GLM-5.2 in Codespaces (text only). The harness files (AGENTS.md + .agent/skills/) are read
automatically by GLM at session start.

════════════════════════════════════════════════════════════════════
PROMPT 0 — TRANSLATOR  (paste in CLAUDE PRO, attach your lookbook pages + GHOST stills)
════════════════════════════════════════════════════════════════════
You are a senior UI/UX engineer. I'm handing these Buddington visual references to a TEXT-ONLY
coding model (GLM-5.2, 1M context) that cannot see images. Convert what you see into an
implementable, text-only spec it can build from with zero image access.

For EACH screen shown (home hero, product grid, product detail, GHOST capsule), output:
- DOM hierarchy (semantic, component-level)
- exact hex colors (map to the house tokens where they match: paper #f4f1ea, ink #16150f,
  gold #c9a44c, signal/red #b8332a, hair #d4cdbd, mute #6c685f)
- spacing in rem, grid/flex behavior, breakpoints
- typography per element: family (Cormorant / JetBrains Mono / Noto Serif JP), weight, size
  in rem, letter-spacing in em
- hover + scroll motion (durations, easing)
- which images are decorative (can be SVG/CSS) vs photographic (need a real file)
Honor the house grammar (Margiela × technical streetwear × Rams restraint; borderless large
image containers; 1px hair rules; Sacred Red at most once per screen). Describe implementable
CSS/DOM, NOT mood. Output as markdown blocks I can paste under the matching headings in
specs/DESIGN.md. Then list, per screen, which photographic assets are required (slot + ideal
dimensions) so I know what to generate or shoot.

→ Paste Claude's output into specs/DESIGN.md. Commit. Switch to Codespaces / GLM-5.2.

════════════════════════════════════════════════════════════════════
PROMPT 1 — DISCOVERY  (GLM-5.2, first message — change nothing)
════════════════════════════════════════════════════════════════════
Read AGENTS.md, .agent/skills/*.md, and specs/DESIGN.md fully. This is an EXISTING Vite +
React + TS + Tailwind repo (Netlify) — surgical edits only, no framework swap, no restructure.

Change NO files. Report:
1. Tree of src/ and public/ (every component + every image/asset file, with paths).
2. How images are referenced today (src/assets import? /public string paths? a products data
   file? CSS background?). Quote 2–3 real examples verbatim.
3. Routing (react-router? routes list) and where product data lives + its TS type.
4. Existing Tailwind theme (tailwind.config.ts): custom colors, fonts, spacing already defined.
5. Whether scripts/gen-assets.mjs has been run (does public/generated/ exist?).
Output a structured report. Then propose the file-by-file plan for the upgrade and STOP for my
confirmation. Fill the ASSET INVENTORY section of specs/DESIGN.md with what exists vs missing.

════════════════════════════════════════════════════════════════════
PROMPT 2 — ASSET PASS  (GLM-5.2 — close the image gap, code-side)
════════════════════════════════════════════════════════════════════
Per skill asset-gen + placeholder:
1. Ensure scripts/gen-assets.mjs exists (it's in the repo). Tell me to run `node
   scripts/gen-assets.mjs` if public/generated/ is empty.
2. Create src/components/AssetPlate.tsx per skill placeholder (if absent).
3. Wire the generated SVGs where DESIGN.md calls for decorative imagery (GHOST hero =
   /generated/ghost-voronoi.svg etc.), as CSS background or <img>, palette-correct, low
   opacity where specified, prefers-reduced-motion safe.
Complete files only. Changed-files list + MISSING ASSETS list (exact slot + suggested path +
dimensions) at the end. Touch nothing photographic that doesn't exist — use AssetPlate.

════════════════════════════════════════════════════════════════════
PROMPT 3 — BUILD  (GLM-5.2 — reuse per screen; one screen per turn)
════════════════════════════════════════════════════════════════════
Implement the [[SCREEN]] section of specs/DESIGN.md against the existing components. Surgical,
complete files. Apply house grammar; Sacred Red at most once (name where). Borderless large
image containers; images via real paths (discovery) or AssetPlate; decorative imagery via the
generated SVGs. Restrained Framer-style motion if the repo already has a motion lib, else CSS
transitions (do not add a heavy dep without asking). Run skill review before finishing:
changed-files list, MISSING ASSETS list, and "Run `npm run dev` to preview."

Screens to do in order: Home → Product grid (Shop) → Product detail → GHOST capsule.

────────────────────────────────────────────────────────────────────
RECOVERY (when GLM drifts)
- "You elided code — re-output the ENTIRE file."
- "Two reds on this screen; spec allows one. Fix + re-output."
- "You invented an image path. Use AssetPlate + add to MISSING ASSETS. Re-output."
- "You changed framework/structure. Revert to the existing Vite/React setup. Surgical only."
- "Re-read AGENTS.md OUTPUT RULES, then redo."
