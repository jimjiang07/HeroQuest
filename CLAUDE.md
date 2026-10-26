# Hero Quest: project guide for Claude Code

Maths and English quests for young children (Kindergarten to Year 2, NSW curriculum, with stretch for keen learners), on
phones, tablets and laptops. Two parts share one set of content files:

1. **The app** (`index.html` + `src/`, Vue 3 + Vite + TypeScript): a **term map** of 20 stones, one stone per session
   (two sessions a week). A session = warm-up, maths (learn, training, game, boss), English (read, words, "How do you
   know?") and a thinking game. Underneath, one quest per skill (Learn it → With help → On your own → Game → Challenge →
   Boss), still playable from "More quests". Help fades or comes back as the child answers. Several children can share a
   device (heroes, no names). Every finished step wins a wearable item for the hero's wardrobe.
2. **Printable worksheets** (`print/`): two double-sided A4 sheets per session (maths, English), the term map and a
   sticker sheet; older quests keep one optional A4 sheet each. Done together with a grown-up. Writing stays on paper
   on purpose.

This repo is **public** (GitHub Pages). Never put names, schools, addresses, photos or anything personal in code, data or docs.

## Design rules (learned the hard way, do not break them)

- **No timers, ever.** No countdowns, no "beat your time", no speed scores. Pressure made the child feel defeated.
- **Wrong answers are gentle.** A wrong tap shakes and says "Try again!". No buzzer, no red cross, no lost points.
- **No scrolling, little on screen.** Every activity screen fits the viewport on phone, tablet and laptop with no scrolling
  inside it. Show only what the current step needs: one question, one picture, a few big answers. Small fingers and busy
  screens confuse young children; when in doubt, split into more screens.
- **One picture and one question per card.** No numbered multi-step layouts: they confused him. Put the known fact *in the picture*
  (for example a bracket labelled "18" and a gold "+6" bag) so he only writes the final answer.
- **Show a worked example first, then fade the help.** On a practice page the order is: labelled picture → picture only → no picture.
  Cards 1-3 carry the most help. Use the striped background for the helped cards.
- **The child plays alone.** Nothing in the app needs a grown-up watching: no "say it out loud", no ticking a card,
  no "I explained it" buttons, no grown-up press-and-hold to finish a step. Every step checks a real answer. The worksheet
  is the together time.
- **Listen first.** Answers stay hidden ("Listen…") and Next stays off until the voice has finished reading
  (`run.listening`, `talking`). English options never show before the word has been heard.
- **Answers can't be guessed.** Maths answers are typed on the number pad, never picked from options. English words are
  picked after listening, or built from letter tiles.
- **Learning in the app = hear, tap, type a number, build a word.** Writing = the worksheet. Do not move writing into the app.
- **Every activity has 1-2 games** after the learning screens, chosen to suit the skill (frog jump on a number line,
  fill the bags, array hunt, sound sort, sentence builder, bridge crossing, memory, balloon pop).
- **No loot-drop section** and no repeating the boss question in a different costume.
- **Boss battles**: the voice reads each question, then the child answers on their own (no pictures). The bonus star is one
  tricky question (missing number, spelling, a sentence gap): reward thinking, not speed.
- **Rewards are wearable items only.** No coins, gems, stars to spend, shop or currency. Every finished step (9 per
  session) wins a small item, a finished session a medium item, and every 4th stone opens the land's chest (a big item
  plus a castle scene). Thinker badges reward effort and strategy (kept trying after "Try again", the boss bonus), never
  speed. Items come in a fixed order (`data/rewards.json`, never random), are worked out from progress (`itemsWon`) so
  they can never be lost, and a wrong answer never removes or holds one back. No streaks, nothing taken away.
- **The item reveal** at the end of each step is a rewarding animation that **cannot be skipped** (Next stays off until
  it ends), short (about 4 s small, 6 s medium, 8 s big), with a gentler version for reduced motion. It ends with a
  silhouette of the next item.
- **Wardrobe**: twelve slots (head, face, neck, badge, body, back, hand, shield, gloves, feet, pet, place), a page at a
  time, tap to wear or take off, plus a play area to pose the hero and pets. Items are drawn on the hero rig
  (`src/art/wear.js`, `src/art/items/`); the child loves the knight/castle world, so most new items fit it. New items:
  draw them in the same style, add them to the catalogue, and show Jim the catalogue image before building.
- **Boss gear**: the older quests' bosses still give one gear piece when first beaten and a second when the rematch is
  won (`reward` in `data/quests.json`). Gear must fit the hero rig (`src/art/rig.js`).
- **Two sessions a week, not daily** (daily was too much). A session is about 40 minutes: maths ~20 (with a 3–4 minute
  warm-up from the other topic), English ~12, thinking game ~8 (tunable in `data/term/2026-t4.json` `minutes`). About
  20 minutes of it is on screen; the rest is the two worksheets. Keep each step short and finishable.
- **Boss battles in the app** are read aloud and answered on the pad by the child alone. On paper the boss box is "say
  it, then write it", done with a grown-up.
- **Doodle art, never emoji.** Every hero, boss, quest picture and button icon is a doodle SVG: thick wobbly navy
  outline (`#2b2d42`), flat soft colours from the palette, simple shapes. Rules, palette and how to add art:
  `docs/art-style.md`; the art is drawn by `scripts/make-art.mjs` (`npm run art` → `public/art/`); icons are
  `src/components/Icon.vue`. Do not hand-edit the SVGs and do not put emoji in buttons, labels or spoken prompts.
- **Heroes are kids in gear** built on one layered rig (skin, hair, outfit, headgear, main hand, off hand, back), so
  outfits and gear can be unlocked by finishing quests. New gear must fit the rig's anchor points.
- **Bosses are cheeky and a bit fierce, not cute:** angry brows, heavy-lidded eyes, teeth and spikes, no blush. Never
  scary, gory or realistic.
- Interesting for every child: a range of heroes and worlds, none labelled for boys or girls; balanced names and pronouns in
  stories and sentences; no stereotyped roles.
- Fingers are welcome. Teach faster strategies next to them (jump through 10, count on from the big number, start from a fact you know).
- Voice is Natasha (`en-AU`), recorded as clips by `npm run voice`; the device's English voice covers anything not recorded.
  Bosses have no voice of their own, only sound effects. Australian spelling and metric units. Money is AUD.
- Calm, specific, encouraging copy. Sentence case. Use ’ in readable text.
- Must work well on phones, tablets and laptops, in portrait and landscape: big tap targets (56px or more on phones, 64px on tablets), no scrolling inside a question, respects reduced motion, works in dark mode.

## Layout and how it works

See `docs/architecture.md` (flow, where things live, the activity module contract, screen rules) and `docs/art-style.md` (the look).
Vue 3 + Vite + TypeScript, Pinia, Vue Router (hash). No CDN scripts; fonts are self-hosted (@fontsource).
`src/learn/` (help ladder, generators, learner model) is pure and unit-tested; keep it free of DOM and Vue.

## Add a quest (most common job)

0. Art: pick a quest item, draw the boss and the quest's map scene in `scripts/make-art.mjs` (see `docs/art-style.md`),
   then `npm run art`.
1. Create `data/units/<unit>.json` with an `"app"` block (`id` = progress key, never rename; `module`; `title`; `intro`;
   `quest {learn, game, help, own, boss}`; `practice {gen, levels}`; plus the module's own content) and a `"print"` block
   (kinds: `math-add`, `math-mul`, `math-arr`, `eng-blend`, `eng-heart`). Copy the closest unit. The module's
   `challenge()` makes step 5 (maths story problems from the unit's `stories`, english spelling).
2. Add it to `data/quests.json` (`unit`, `subject`, `art`, `boss {name, art}`, `reward`, `map {scene, path}`, `needs`); `art` names are
   files in `public/art/`, and `path` gives this quest's own winding road (six stones, Learn it first).
3. `npm run dev`, play every step at phone and tablet size; open `print/index.html#<quest id>` and check the optional sheet.
4. `npm run voice` to record the quest's new lines (needs `uv`; commit `public/voice/`), `npm run pdfs` to write
   `public/worksheets/quests/<id>.pdf`, then `npm test`.

A new kind of interaction needs a module in `src/activities/<name>/` (copy `add10`), registered in `src/activities/index.ts`,
and a play-through test in `tests/e2e/`.

## The term and the worksheets

- `data/term/2026-t4.json`: 20 stones in 5 lands (Castle Gate, Tournament Field, Royal Garden, Castle Walls, Dragon
  Hill); each stone names its warm-up, maths, English and thinking units. The map shows stone numbers only (topic-free):
  Jim chooses and reorders content in Grown-ups > Plan (saved per device as `st.plan`).
- Each session has two double-sided A4 sheets (maths and English): front = learning side (look, read and say aloud,
  minimal writing, worked example in pictures), back = practice side (~20 exercises, help fading down the page, the boss
  box). Plus a printable term map (colour a stone after each session, open a chest per land) and a sticker sheet.
  Writing practice stays on paper.

## Term 4 2026 plan (10 weeks × 2 sessions)

Goal: a calm, fingers-free foundation. He counts up on his fingers for multiplication and add/sub is the bottleneck:
replace counting-up with skip counting, equal-group pictures, ten-frames and "known fact + one more group". Session A =
add/sub focus, Session B = multiplication focus, each with a warm-up from the other topic.
- Weeks 1–2 (built): A bonds to 10 then 20, subtraction within 10 then 20 on ten-frames and number lines; B skip
  counting 2s, 5s, 10s with equal groups, ×2 ×10 ×5. Thinking: patterns, odd one out, who is taller, shapes.
- Weeks 3–4: A bonds to 20, doubles/near doubles and make-10 as small worked examples inside quests (not named quests);
  B ×3 (×2 plus one group), ×4 (double the doubles).
- Week 5: A mixed within 20; B a shape-hunt break session (2D shapes around the house) plus light multiplication review.
- Weeks 6–7: A missing numbers (? + 5 = 12), mixed within 20; B arrays, halving and sharing equally, fact families.
- Week 8: A tens and ones, add/sub within 50 with tens frames and number lines; B ×3 and ×4 consolidation.
- Week 9: mixed review; word problems where he draws first, then writes the equation.
- Week 10: review and celebration ("Legend" level). Checkpoints Jim observes (nothing timed shown to him): add/sub within
  20 without fingers; ×2, ×5, ×10 recalled calmly.
- English each session: read aloud for fluency (decodable, then early chapter books), vocabulary, "How do you know?"
  inference on a short passage. Thinking games rotate patterns, odd one out, simple logic, shapes, number sequences.

## Long-term plan (content should grow toward this)

The selective tests reward fast mental maths (no calculator), reading comprehension and reasoning. Prep = fact fluency,
a strategy toolkit, drawing word problems, regular reasoning games, plenty of reading, and "How did you figure that out?
Is there another way?"
- Year 1 (2027): add/sub to 100 mentally; place value to 1000; times tables to 10×10 (stretch); halves and quarters;
  time to the half hour; coins. Reasoning: patterns, simple logic, odd one out, 2D shapes and symmetry. English: fluent
  chapter books, retelling, "why do you think…?"
- Year 2 (2028): 3-digit mental add/sub; division as sharing and grouping; unit fractions; length, mass, capacity;
  simple graphs; two-step word problems. Reasoning: number sequences, deduction, analogies, cubes and nets. English:
  inference, vocabulary in context, summarising.
- Year 3 (2029): Stage 2 stretch: 12×12 fluent, 4-digit numbers, equivalent fractions, decimals, perimeter and area,
  angles, 3D shapes, chance words, multi-step problems. OC-style questions, untimed first; short timed sets only late in
  the year, framed as beating his own record. English: longer texts, poetry, non-fiction, comparing texts, paragraphs.
- Year 4 Term 1: OC test. Years 4–6: Stage 3 stretch (fractions, decimals, ratio, algebra thinking), timed practice,
  selective-style writing from Year 5.
- Always: no exam-style practice before Year 3; go wider (more puzzle types) before going faster. Until then, no timers.

## Working agreements

- Test before you push: `npm ci && npx playwright install chromium && npm test` (Vitest unit tests, then Playwright at
  phone and tablet sizes, which also fails if any screen scrolls).
- Deploy = push to `main`. The GitHub Action builds, tests and publishes `dist/` to Pages at the same URL. Progress is
  stored per device in `localStorage` under `hq-v1`, so do not change the URL or the key casually.
- Ask before adding anything that collects data, needs a login, or shows ads. The answer is almost certainly no.
