# Hero Quest: project guide for Claude Code

Maths and English quests for young children (Kindergarten to Year 2, NSW curriculum, with stretch for keen learners), on
phones, tablets and laptops. Two parts share one set of content files:

1. **The app** (`index.html` + `src/`, Vue 3 + Vite + TypeScript): one quest per skill, each with 5 steps and a boss
   (Learn it → With help → On your own → Game → Paper quest → Boss). Help fades or comes back as the child answers.
   Several children can share a device (heroes, no names).
2. **Printable worksheets** (`print/`): one A4 sheet per quest, the "Paper quest". Writing stays on paper on purpose.

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
- **Learning in the app = read, say, tick, tap.** Writing = the paper quest. Do not move writing into the app.
- **Every activity has 1-2 games** after the learning screens (memory, balloon pop, word builder, bridge crossing).
- **No loot-drop section** and no repeating the boss question in a different costume.
- **Boss battles are said out loud first**, written second. The bonus star is "Explain one": reward explaining, not speed.
- Keep a step short and finishable (5–10 minutes). Screen time under 10 minutes a day.
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
   (kinds: `math-add`, `math-mul`, `math-arr`, `eng-blend`, `eng-heart`). Copy the closest unit.
2. Add it to `data/quests.json` (`unit`, `subject`, `art`, `boss {name, art}`, `map {scene, path}`, `needs`); `art` names are
   files in `public/art/`, and `path` gives this quest's own winding road (six stones, Learn it first).
3. `npm run dev`, play every step at phone and tablet size; open `print/index.html#<quest id>` and check the sheet.
4. `npm run voice` to record the quest's new lines (needs `uv`; commit `public/voice/`), `npm run pdfs` to write
   `public/worksheets/quests/<id>.pdf`, then `npm test`.

A new kind of interaction needs a module in `src/activities/<name>/` (copy `add10`), registered in `src/activities/index.ts`,
and a play-through test in `tests/e2e/`.

## Planned content (Term 4 and beyond)

- Maths: times tables one table at a time (2, 5, 10, 3, 4, 6, 7, 8, 9, mixed). Addition/subtraction fluency (jump through 10, back through 10, then tens and ones, mixed word problems).
- English: consonant blends, digraphs (sh, ch, th), common words, short sentences, writing a sentence, a four-sentence story.
- A 5-minute thinking game each day (patterns, odd one out, simple logic). Long-term aim: selective high school, which includes writing, so protect writing practice.

## Working agreements

- Test before you push: `npm ci && npx playwright install chromium && npm test` (Vitest unit tests, then Playwright at
  phone and tablet sizes, which also fails if any screen scrolls).
- Deploy = push to `main`. The GitHub Action builds, tests and publishes `dist/` to Pages at the same URL. Progress is
  stored per device in `localStorage` under `hq-v1`, so do not change the URL or the key casually.
- Ask before adding anything that collects data, needs a login, or shows ads. The answer is almost certainly no.
