# SKILL: review — self-audit before "done"

Run this checklist on your own output before ending a task. Report pass/fail per line.

## Output integrity
- [ ] Every file is COMPLETE (no "...unchanged", no truncation). If a file is long, it's whole.
- [ ] Only files that needed changing were touched. Existing imports/props/data preserved.
- [ ] TypeScript strict clean — no `any`, props typed. Would `npm run build` pass?

## Brand fidelity
- [ ] Palette only — no off-token hex. Reused existing Tailwind names, no duplicates added.
- [ ] Sacred Red (#b8332a) appears AT MOST ONCE per screen. Name the one place. If two, fix.
- [ ] Type roles correct: Cormorant display, JetBrains Mono UI/labels/prices, JP accents.
- [ ] Borderless large image containers; 1px --hair rules; folio footer present where due.

## Images
- [ ] No broken <img>. Real paths confirmed in discovery, else <AssetPlate/>.
- [ ] Tier-1 decorative imagery generated as SVG/CSS, not invented binary paths.
- [ ] MISSING ASSETS list is complete and gives exact slot + suggested path + dimensions.

## Motion + a11y
- [ ] Motion restrained (reveal 600ms ease [0.16,1,0.3,1]; hover scale 1→1.05). 
- [ ] prefers-reduced-motion respected.
- [ ] Alt text real; focus ring 2px --gold; body contrast ≥ 4.5:1.

End with: changed-files list, MISSING ASSETS list, and one line: "Run `npm run dev` to preview."
