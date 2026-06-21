# RUNBOOK — Buddington store in Codespaces with Claude Code + GLM-5.2

Exact steps, in order. Two actors: CLAUDE PRO (sees images, writes specs) and GLM-5.2 (builds,
in Claude Code, in the Codespace). The Karpathy agent stack + the /goal loop are built into the
harness files, so GLM picks them up automatically.

────────────────────────────────────────────────────────────
A. ONE-TIME SETUP (in the Codespace terminal)
────────────────────────────────────────────────────────────
1. Open the repo in a Codespace (github.com → your repo → Code → Codespaces → Create).
2. Copy the harness into the repo root (keep your existing app untouched):
   - AGENTS.md, CLAUDE.md  → repo root
   - .agent/skills/*.md     → repo root /.agent/skills/
   - scripts/gen-assets.mjs → repo root /scripts/
   - specs/DESIGN.md        → repo root /specs/
   - prompts/PROMPTS.md     → keep for reference (you paste from it)
3. Install Claude Code:
     npm install -g @anthropic-ai/claude-code
4. Point Claude Code at GLM-5.2 (Z.ai). Store the key as a Codespaces Secret named
   ANTHROPIC_AUTH_TOKEN (repo → Settings → Secrets and variables → Codespaces), then either
   rely on .claude/settings.json (if present) OR export inline before launch:
     export ANTHROPIC_BASE_URL="https://api.z.ai/api/coding/paas/v4"
     export ANTHROPIC_DEFAULT_OPUS_MODEL="glm-5.2[1m]"
     export ANTHROPIC_DEFAULT_SONNET_MODEL="glm-5.2[1m]"
     export ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.7"
     export API_TIMEOUT_MS="3000000"
     export CLAUDE_CODE_AUTO_COMPACT_WINDOW="1000000"
   (If that base URL 404s, use https://api.z.ai/api/anthropic instead.)
5. Generate the code-drawn assets (no upload, runs in the cloud):
     node scripts/gen-assets.mjs        # writes public/generated/*.svg
6. Start the live preview in a second terminal so you can verify changes instantly:
     npm run dev                        # Codespaces gives a forwarded URL to open

────────────────────────────────────────────────────────────
B. LAUNCH + VERIFY THE MODEL
────────────────────────────────────────────────────────────
7. In the first terminal:  claude
8. Inside the session:
     /status          → confirm GLM-5.2 is active
     /effort          → set MAX (best for coding/long-horizon work)
     "What model are you?"   → must say GLM, not Claude/GPT. If wrong, recheck base URL/key.

────────────────────────────────────────────────────────────
C. TRANSLATE YOUR DESIGNS (Claude Pro — only step that uses images)
────────────────────────────────────────────────────────────
9. Open a CLAUDE PRO chat (NOT GLM). Attach your real Buddington lookbook pages + GHOST stills.
   Paste PROMPT 0 from prompts/PROMPTS.md.
10. Paste Claude Pro's returned spec blocks under the matching headings in specs/DESIGN.md.
    Commit. GLM builds from this text; it never needs the images.

────────────────────────────────────────────────────────────
D. BUILD THE UPGRADE (GLM-5.2 — low autonomy first, Karpathy "leash")
────────────────────────────────────────────────────────────
11. PROMPT 1 (discovery) — GLM reads the repo, reports structure, changes nothing. Confirm.
12. PROMPT 2 (asset pass) — creates AssetPlate, wires generated SVGs, lists MISSING ASSETS.
13. PROMPT 3 (build) — ONE screen per turn: Home → Shop → Product → GHOST.
    After each: glance at the npm-run-dev preview (fast generation→verification loop), then
    say "continue" or correct. Keep diffs small; that's the whole point.
14. For any MISSING ASSETS (real photos): decide per item — generate more SVG plates, use
    AssetPlate, or upload a real image via GitHub web UI / drag into the Codespace file
    explorer (cloud-to-cloud, nothing local). Then re-run that screen's prompt to wire it.

────────────────────────────────────────────────────────────
E. RUN THE GOAL LOOP (GLM-5.2 — high autonomy, but checkpointed)
────────────────────────────────────────────────────────────
15. When the app is functional enough to audit, paste PROMPT 4 (the /goal loop).
16. GLM runs PHASE 1 (audit every feature → user stories → FEATURES.md), then STOPS.
    Review the tracker in the editor. Type:  continue
17. PHASE 2 (test every story, document every error), then STOPS. Review the error list.
    Type:  continue
18. PHASE 3 (fix every logic + UX error, smallest diff each), then STOPS. Review diffs in the
    preview. Type:  continue
19. PHASE 4 (re-test everything post-fix, regression pass) → final FEATURES.md report.
    Steer anytime with:  status · redo <id> · stop
20. Commit FEATURES.md + FEATURES.csv as your living QA record.

────────────────────────────────────────────────────────────
F. DEPLOY
────────────────────────────────────────────────────────────
21. git add -A && git commit -m "Buddington upgrade + QA loop" && git push
22. Netlify auto-builds from main (netlify.toml is in the repo). Check the deploy preview.

────────────────────────────────────────────────────────────
GUARDRAILS (why this stays reliable, per Karpathy)
────────────────────────────────────────────────────────────
- GLM declares an autonomy level each turn; you keep it on the lowest that fits.
- Small diffs + live preview = fast verify; you catch bad changes in seconds, not after 600 lines.
- The loop ALWAYS stops between phases — you own every phase transition, never the model.
- Status changes need evidence (a test or a rendered route), never the model's say-so.
- If GLM says it's "lost in the woods" or unsure — that's the system working. Answer, don't push.
- Cost: GLM-5.2 quota is 3× peak (08:00–12:00 Cape Town) / 2× off-peak. Run loops off-peak.
