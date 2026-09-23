# Buddington Harness — GLM-5.2 builder + Claude Pro translator

Drop-in harness to upgrade your EXISTING Vite + React + TS + Tailwind store (Netlify) using
GLM-5.2 in Claude Code on Codespaces, with Claude Pro as the multimodal translator/reviewer.

## The honest answer on images
GLM-5.2 can't see, generate, or fetch image pixels — no prompt changes that. So this harness
covers images three ways instead:
- Tier 1 decorative/brand imagery → GENERATED AS CODE (scripts/gen-assets.mjs emits SVG tiles
  into public/generated/). No upload, runs in the Codespace.
- Tier 2 editorial/garment plates → <AssetPlate/>, a branded SVG placeholder (not a fake photo).
- Tier 3 real photography → wired only if the file already exists; else flagged in MISSING ASSETS.
Real garment photos of a fictional brand genuinely don't exist; the harness names exactly what
you'd need to shoot/generate/upload rather than inventing broken paths.

## Files — copy these into your repo root
- AGENTS.md                  harness brain (auto-read by GLM each session)
- .agent/skills/asset-gen.md generate imagery as SVG/CSS
- .agent/skills/placeholder.md  <AssetPlate/> spec
- .agent/skills/review.md    self-audit checklist
- scripts/gen-assets.mjs     run `node scripts/gen-assets.mjs` → public/generated/*.svg
- specs/DESIGN.md            spec; Claude Pro fills the per-screen blocks
- prompts/PROMPTS.md         PROMPT 0 (Claude Pro) + 1–3 (GLM)

## Flow
1. Copy files in. `node scripts/gen-assets.mjs` to seed public/generated/.
2. PROMPT 0 in Claude Pro with your real lookbook/GHOST images → paste output into specs/DESIGN.md.
3. In Codespaces, Claude Code on GLM-5.2: PROMPT 1 (discovery) → 2 (assets) → 3 (build, per screen).
4. `npm run dev` to preview live.

## Why it performs
GLM scores well on code-level design benchmarks (layout/type/CSS) — that's exactly what we ask
of it. We never ask it to imagine pixels. The 1M context holds AGENTS.md + skills + DESIGN.md +
your whole src/ at once, so edits stay consistent. Claude Pro does the seeing; GLM does the building.
```
NOTE: AGENTS.md is the de-facto standard many agent harnesses read. If your Claude Code setup
prefers CLAUDE.md, just copy AGENTS.md to CLAUDE.md — same content.
```

## Sound — Spotify & Apple Music while you shop

A small **SOUND** control sits in a bottom corner of every view. Music started
there keeps playing across the whole store — shop, product pages, GHOST, and
the 3D experience — because the player lives above the view tree
(`src/music/`, `src/components/MusicDock.tsx`).

Three ways to play, one at a time:

| Mode | Needs | What the shopper gets |
| --- | --- | --- |
| Paste a link | nothing | The provider's official embed player for any Spotify or Apple Music playlist, album or track link. |
| Connect Spotify | `VITE_SPOTIFY_CLIENT_ID` | Their own playlists, played in the page with play/pause/next. Spotify only plays through the Web API for **Premium** accounts; free accounts are pointed to paste-a-link. |
| Connect Apple Music | `APPLE_MUSIC_*` on Netlify | Their library playlists via MusicKit. Without a subscription, MusicKit reports preview-only and the dock says so. |

With nothing configured the store still works: only paste-a-link is offered,
and Connect buttons are hidden rather than shown broken. Copy `.env.example`
for the full list.

**Spotify.** Create an app in the Spotify developer dashboard, add each site
origin with a trailing slash (e.g. `https://your-site.netlify.app/`) as a
Redirect URI, and set `VITE_SPOTIFY_CLIENT_ID`. Sign-in uses Authorization Code
with PKCE, so there is no client secret. A new Spotify app starts in development
mode, where only accounts you add in its dashboard can sign in; open it to all
shoppers through Spotify's quota extension.

**Apple Music.** Needs an Apple Developer Program membership and a MusicKit
private key. Set `APPLE_MUSIC_TEAM_ID`, `APPLE_MUSIC_KEY_ID`,
`APPLE_MUSIC_PRIVATE_KEY` and (recommended) `APPLE_MUSIC_ALLOWED_ORIGINS` in
Netlify's environment. `netlify/functions/apple-music-token.mjs` signs a
short-lived developer token server-side, so the key never reaches the browser.
Locally, use `netlify dev` — plain `npm run dev` has no functions, and the dock
treats Apple Music as not configured.

`npm test` covers link parsing, PKCE and the token signer.
