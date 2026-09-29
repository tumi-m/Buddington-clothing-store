# Buddington home: "Stand still"

**Self-authored, not interviewed.** The request was "improve ui and ux" with the
scroll-craft procedure attached. The owner was not available to answer the
eight questions, and the request does not explicitly hand over creative
direction, so every answer below is an authored decision grounded in the
brand's own material. Evidence and assumptions are marked separately.

## Evidence (what the brand already is)

Read from the six photographs in `public/images/`, opened and inspected, plus
the existing site copy and `CLAUDE.md`:

- **Two B&W night street photographs of the same man standing dead still**
  while the city smears past him. One in a white Buddington tee on a road with
  traffic streaking by (`IMG_5821`), one in a white hoodie with the iridescent
  wordmark inside a crowd walking at him (`IMG_5822`). Stillness against motion
  is the brand's recurring image, not an idea imposed on it.
- **An iridescent chrome wordmark**, arched, on near-black (`IMG_5678`).
- **A hand-off**: a Buddington kraft bag passed from a hand in a wax-print
  sleeve to a hand in a black leather glove (`IMG_5912`). Read as the site's
  own stated "Cape Town to Tokyo" axis.
- **A poster**: the wordmark cut into vertical slats over folded white hoodies
  (`IMG_5888`).
- **A parody tee**, "Los Buddington Hermanos" (`IMG_6300`). The brand has a
  sense of humour.
- Existing copy: "The weight of silence", "Garments that speak in texture
  rather than logo", "the quiet weight of urban existence", "Cape Town to
  Tokyo", A/W 41, six pieces, the Ghost anti-computer-vision capsule, the
  wind-tunnel experience.

**Facts I will not invent:** no statistics, no stockists, no reviews, no
delivery or returns promises. The previous home page carried "Free returns
within 30 days". Nothing in the repo supports it, so it is removed.

## The eight topics (authored)

1. **Vibe:** still, nocturnal, precise, a little wry. References: the two street
   photographs themselves; a long-exposure night street shot where only one
   figure is sharp; a record sleeve with one word on it.
2. **The journey, in order:** the city rushing past one still man; a line about
   everyone being in a hurry; the chrome wordmark; texture instead of logo; a
   joke; a breath of nothing; the crowd again, and this time the visitor is the
   one who stops; the hand-off between two cities; the six pieces; the wind
   tunnel; Ghost; shop.
3. **Energy:** fast and cut-heavy for most of the page, because that is the
   city. The one slow moment is the peak.
4. **Feeling and the one moment:** see the curve below. The moment: *the crowd
   stops blurring the second you stop scrolling.*
5. **What no other site does:** the page only holds still when you do.
6. **Distance from premium-minimal:** moderate. Mostly monochrome photography
   and stark type, with one loud accent used as a full-bleed ground twice.
   Streetwear, not luxury hush.
7. **One world or distinct scenes:** distinct scenes, hard cuts. One unbroken
   world would erase the contrast between moving and stopping, which is the
   whole idea, and the site already has a continuous camera flight on the
   Experience page.
8. **Assets:** the six photographs above. Nothing generated (no generation key
   in this environment). Hero and peak layers are cut from the real photos.

## Journey

```
1  Pulse        the street rushes past a man who does not move
2  Impatience   everyone is late for something
3  Desire       the chrome wordmark, alone
4  Curiosity    texture, not logo
5  Amusement    the parody tee
6  Silence      nothing, on purpose
7  Stillness    the crowd again; you stop, and so does it   <- PEAK
8  Warmth       Cape Town to Tokyo, hand to hand
9  Appetite     the six pieces
10 Play         put it in a gale before you buy it
11 Intrigue     Ghost
12 Decision     shop the collection
```

## Feeling curve (written before the score)

```
1  Pulse       traffic streaks past a man in a white tee who is perfectly sharp
2  Impatience  a hard cut to paper, one line at scale, words landing fast
3  Desire      the iridescent wordmark wiping up out of black
4  Curiosity   folded cotton behind slats, one short line about texture
5  Amusement   the Hermanos tee on a loud blue ground, tilting toward the pointer
6  Silence     an off-black screen with nothing on it
7  Stillness   the crowd rushes while you scroll, freezes when you stop, and only
               then does the last line appear, addressed to you
8  Warmth      two hands, two cities, one bag, wiping in from the side
9  Appetite    six labelled pieces arriving in quick succession
10 Play        "put it in a gale" assembling word by word
11 Intrigue    Ghost opening as an iris on black
12 Decision    the whole screen is the call to action, and it holds
```

No two adjacent lines share a feeling.

## The peak

> "The whole crowd was smeared while I scrolled, and the second I stopped it
> froze, and then it said *you stopped*."

Lives in act 7. It gets the best cutout of the set (the hoodie photograph), the
largest span on the page (1.4 viewport-heights against 1.1 for the next
largest), and act 6 is authored silence directly in front of it.

## Tell-someone sentence

**It's the site where the whole city blurs past you while you scroll, and the
guy in the hoodie never moves, and the moment you stop, everything stops with
him.**

## Authored silence

Act 6 is a deliberately empty off-black viewport (0.6 viewport-heights). It is
not dead scroll. It is the quiet in front of the peak.

## Grammar: rhythmic cutlist

Twelve short hard-cut sections, none over 1.4 viewport-heights, no pinning, no
dwell, grounds painted per section so every change lands on a hard edge.

Why the other seven lost:

- **Filmic one-shot:** hides its seams, and this brand's idea *is* the seam
  between moving and stopping. The site already has a continuous flight on the
  Experience page.
- **Chaptered editorial:** there is one sentence of brand substance, not a long
  read. Filling chapters would mean inventing copy.
- **Live surface:** it is a clothing store. Its live surface (the wind tunnel)
  already has its own page.
- **Continuous world:** no geography to travel, and it needs generated
  worldflight video with no generation key or ffmpeg here.
- **Typographic poster:** the strongest asset is photography of a person. A
  type-only page throws it away.
- **Gallery / catalog:** the Collection page is already the catalog. Home's job
  is belief, not range.
- **Split stage:** the tension (one still figure inside a moving crowd) lives
  inside a single frame, not across two columns, and the grammar bans the
  full-bleed photography this depends on.

**Reconciling the cutlist ban on `parallax` with the hero-depth baseline:**
depth comes from occlusion (the headline passes behind the man) and from the
signature move, where the crowd plane changes (streak, drift) with scroll
velocity while the subject plane never moves. Nothing is driven by scroll
position at a different rate, so the banned device is not used.

## Signature move: the crowd only moves when you do

Hero and peak are each three planes cut from the real photographs: a clean
crowd plate (the man removed and the gap rebuilt), a motion-streaked copy of
that plate, and the man as a genuine alpha cutout on top. The page reads the
visitor's scroll velocity. While they scroll, the streaked crowd fades in and
drifts against the direction of travel; the man stays perfectly sharp. When
they stop, the crowd freezes. In the peak, holding still for a moment is what
reveals the final line. The page opens mid-rush and settles, so the mechanic
teaches itself without a scroll cue.

## Score

| # | Beat | Feeling | Device | Span (vh) | Ground |
|---|---|---|---|---|---|
| 1 | Pulse | pulse | signature (velocity planes) + type behind subject | 1.1 | photo |
| 2 | Impatience | impatience | kinetic words | 0.8 | paper |
| 3 | Desire | desire | reveal up | 1.0 | ink |
| 4 | Curiosity | curiosity | flow + in (split) | 1.0 | paper-2 |
| 5 | Amusement | amusement | tilt (pointer) | 0.8 | accent |
| 6 | Silence | silence | none, authored | 0.6 | ink |
| 7 | Stillness | stillness (PEAK) | signature + dwell-to-resolve | 1.4 | photo |
| 8 | Warmth | warmth | reveal left | 1.1 | paper |
| 9 | Appetite | appetite | flow + in (stagger) | 1.1 | ink |
| 10 | Play | play | kinetic words | 0.8 | paper-2 |
| 11 | Intrigue | intrigue | reveal iris (once) | 0.8 | ink |
| 12 | Decision | decision | flow, holds | 1.0 | accent |

Total 11.5 viewport-heights over 12 acts. Five device families (signature,
kinetic, reveal, flow+in, tilt), never the same one twice in a row, zero scrub
acts, outside the 6-to-7-acts at 13.6-to-13.8vh band.

**Nav:** loud. Full-width ink bar, the wordmark and "Shop the collection" at the
same weight. **Close:** abrupt; the last cut is the call to action at full
bleed, holding, with no footer after it.

## Engine note

The scroll-craft engine binds to `window` scroll, has no teardown, and runs its
loop for the life of the page. This site is a single-page React app that
scrolls inside its own container and mounts and unmounts views. Mounting the
engine per visit would leak a scroll listener and a render loop every time the
home page is opened. The cutlist grammar needs none of the engine's pinned
devices, so the page uses the site's existing primitives (once-only reveals,
clip-path wipes, split-word type) held to the same rules, plus page-local code
for the signature move. The engine was not edited.

## As built (measured)

- 12 acts, 11.4 viewport-heights at 1440x900 (11.6 at 390x844). The hero
  measures one viewport under the bar rather than the planned 1.1; the peak
  holds the largest span at 1.4.
- Hero and peak planes: `public/film/`, cut from `IMG_5821` and `IMG_5822`
  with `birefnet-portrait` and `u2net_human_seg` respectively, clean plates
  rebuilt by inpainting, streak plates by a horizontal motion kernel. The six
  source photos weighed 9.6 MB; the delivered set is under 1 MB.

## Feel check (done cold, then diffed)

| Act | Intended | Felt | Change |
|---|---|---|---|
| 1 | pulse | arrest | The opening rush settled in about a second, so the hero read as stillness and pre-empted the peak. Arrival now holds the rush for 1.6 s before settling. |
| 2 | impatience | hurry | none |
| 3 | desire | shine | none |
| 4 | curiosity | curiosity | none |
| 5 | amusement | grin | none |
| 6 | silence | breath | none |
| 7 | stillness (peak) | held | none; the band scrim was cut back so it no longer dims the hoodie's wordmark |
| 8 | warmth | warmth | none |
| 9 | appetite | browsing | none |
| 10 | play | invitation | kept; close enough, and not adjacent to anything that shares it |
| 11 | intrigue | intrigue | the pattern had carried the retired gold palette; recoloured |
| 12 | decision | decision | none |
