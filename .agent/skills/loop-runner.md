# SKILL: loop-runner — the /goal autonomous loop (audit → test → fix → re-test)

Triggered ONLY by an explicit `/goal ...` from the human. This is the [LOOP] autonomy level.
It runs in PHASES with a hard checkpoint between each — you stop and wait for "continue".
Governed by skill agent-stack: small diffs, fast verification, evidence over assertion.

## The canonical artifact: FEATURES.md (single source of truth)
One Markdown table in the repo root, the ONLY place feature status lives. Never duplicate it.
If a real spreadsheet is wanted, also emit FEATURES.csv with identical rows (xlsx skill can
convert), but FEATURES.md is canonical. Columns:

| id | feature | user_story | expected_behaviour | source_files | status | last_error | evidence |
|----|---------|-----------|--------------------|--------------|--------|-----------|----------|

status ∈ {todo, story-written, testing, error-found, fixing, fixed, verified}
evidence = how it was confirmed (test name + pass, or "rendered /shop, hover works").
NEVER set `verified` without evidence. Assertion ≠ evidence.

## The four phases (checkpoint + WAIT between each)

### PHASE 1 — AUDIT & SPEC
Walk every feature in the app FROM THE CODE (components, routes, handlers, data).
For each: write a user story ("As a shopper, I can filter the grid by category") and the
expected behaviour derived from what the code actually does. Write/append rows to FEATURES.md
with status `story-written`. Do NOT test or fix yet.
→ CHECKPOINT: post the FEATURES.md table + count. Wait for "continue".

### PHASE 2 — TEST & DOCUMENT
For each row, exercise the user story and record what actually happens vs expected.
- Prefer real tests (Vitest/Playwright if present; add Vitest if absent AND human approves).
- Where automated testing isn't feasible, do a concrete manual check script: exact route +
  steps + observed result, and say so honestly (don't pretend a manual check is a test).
Update each row: status `testing` → `error-found` (fill last_error) or `verified` (fill evidence).
Document EVERY error, however small, as its own line. No silent skips.
→ CHECKPOINT: post the error list (ids + last_error), grouped logic-error vs ux-error.
  Wait for "continue".

### PHASE 3 — FIX (smallest diffs, one error at a time)
Fix every logic error and UX error found. Per agent-stack: smallest diff per fix, one concern
at a time, no scope drift. After each fix set status `fixing` → and note the diff in ≤1 line.
Fix logic errors before cosmetic UX where they interact. Re-run that item's test immediately;
if green, `fixed`. If a fix is risky or ambiguous, STOP and ask rather than guessing.
→ CHECKPOINT: changed-files list + which ids moved to `fixed`. Wait for "continue".

### PHASE 4 — RE-TEST POST-FIX (regression pass)
Re-run EVERY user story (not just the fixed ones — fixes cause regressions). Update rows to
`verified` with evidence, or back to `error-found` if regressed (loop that item to Phase 3).
→ FINAL REPORT: full FEATURES.md, counts by status, any still-open items, and a short
  "what I'd watch" list. Then STOP.

## Loop discipline (the leash on the loop)
- Between phases you ALWAYS stop. The human owns the phase transition. No "I'll just keep going."
- Within a phase, work in slices; if the app has >15 features, do the audit in batches and
  checkpoint per batch.
- Every status change is backed by a file you touched or a test you ran — traceable, not vibes.
- If you find yourself "lost in the woods" (uncertain, repeating, scope ballooning): stop,
  summarize state, ask. That is success, not failure.
- Token hygiene: FEATURES.md is the memory. You don't need to re-derive prior phases from
  scratch — read the table, trust its status column, act on what's not yet `verified`.

## How the human drives it
  /goal <the objective>           → you begin Phase 1, then checkpoint.
  continue                        → advance to the next phase.
  redo <id>                       → re-audit/test/fix a single feature.
  status                          → reprint FEATURES.md as-is, change nothing.
  stop                            → halt the loop, leave the tracker intact.
