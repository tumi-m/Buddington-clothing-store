# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| buddington-still | Rhythmic cutlist | Loud full-width ink bar: wordmark and "Shop the collection" at equal weight, bag, progress rail | Three planes cut from a real photo (clean plate, streak plate, alpha subject); headline parts around the subject and passes behind his shoulders; arrival holds a rush, then settles | 12 hard-cut acts, 11.4vh: signature, kinetic, reveal, flow, tilt, silence, signature (peak 1.4vh), reveal, flow, kinetic, iris, flow | Full-bleed call to action on the accent ground that holds; no footer | The crowd only moves when you do: scroll velocity streaks and drifts the crowd plane while the subject never moves; holding still resolves the peak's last line | Low-key B&W night street photography, the brand's own | SPA (React), no engine |


---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Rhythmic cutlist** with a loud ink bar and an abrupt full-bleed CTA close (buddington-still).
- **Velocity-driven crowd plane against a still cutout** as a signature move (buddington-still).
- **Headline split around a subject, passing behind the shoulders**, as a hero device (buddington-still).
- The band of **12 acts at 11.4vh** (buddington-still).

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
