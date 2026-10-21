# Hero Quest: project guide for Claude Code

Daily maths and English practice for a young child (Kindergarten, NSW curriculum, working slightly ahead). Two parts that
share one set of content files:

1. **The app** (`index.html` + `src/`): interactive activities for an iPad, with voice, sounds, animation and games.
2. **Printable worksheets** (`print/`): one double-sided sheet per day: maths writing practice on the front, English on the back
   (about 15 questions each). Learning (reading, saying aloud) happens in the app; the print page's "Learning side too" box
   still prints it when a unit has no app version yet. Writing stays on paper on purpose.

This repo is **public** (GitHub Pages). Never put names, schools, addresses, photos or anything personal in code, data or docs.

## Design rules (learned the hard way, do not break them)

- **No timers, ever.** No countdowns, no "beat your time", no speed scores. Pressure made the child feel defeated.
- **Wrong answers are gentle.** A wrong tap shakes and says "Try again!". No buzzer, no red cross, no lost points.
- **One picture and one question per card.** No numbered multi-step layouts: they confused him. Put the known fact *in the picture*
  (for example a bracket labelled "18" and a gold "+6" bag) so he only writes the final answer.
- **Show a worked example first, then fade the help.** On a practice page the order is: labelled picture → picture only → no picture.
  Cards 1-3 carry the most help. Use the striped background for the helped cards.
- **Learn side = read, say, tick, circle.** Practice side = write. Do not move writing into the app.
- **Every activity has 1-2 games** after the learning screens (memory, balloon pop, word builder, bridge crossing).
- **No loot-drop section** and no repeating the boss question in a different costume.
- **Boss battles are said out loud first**, written second. The bonus star is "Explain one": reward explaining, not speed.
- Keep a session short and finishable: about 15 minutes maths, 10 minutes English, 5 minutes of a thinking game. Screen time under 10 minutes a day.
- Fingers are welcome. Teach faster strategies next to them (jump through 10, count on from the big number, start from a fact you know).
- Voice is Australian English (`en-AU`, falling back to any English voice). Australian spelling and metric units. Money is AUD.
- Calm, specific, encouraging copy. Sentence case. Use ’ in readable text.
- Must work well on an iPad in portrait and landscape: big tap targets (64px or more), respects reduced motion, works in dark mode.

## Layout

```
index.html                app shell (header, stage, footer, settings dialog, SVG symbols)
src/
  engine.js               storage, sound, voice, step flow, home page (quest map), settings. Activities plug in via start()
  shared.js               EMO (emoji for words), BL (blends), hlw() (highlight a blend), NUMW, shuffle: used by app AND print
  styles.css              all app styles (design tokens at the top of the file)
  app.js                  builds the quest map from plan.json: one step per day (maths + English), drawn by MODULES[app.module]
  activities/             one module per activity: export default function make(data) → {id, subject, title, steps, games, R, intro, end}
data/
  plan.json               which unit is on which day (week → day → subject → unit id), plus lands and session days for the path
  units/<id>.json         content for one unit: "app" (null if there is no interactive version yet) and "print" (sheet content)
print/
  index.html, print.js, print.css    draws the sheets for a day from plan.json + units. Open print/index.html#2-wed
worksheets/               one PDF per planned day (npm run pdfs), linked from the app's day card
scripts/make-pdfs.mjs     writes those PDFs from the print page
tests/smoke.spec.js       Playwright: each activity can be played to the end, each planned print day renders without overflow
legacy/                   older standalone worksheets; port into units when needed (see legacy/README.md)
```

Plain HTML, CSS and JavaScript modules. No framework, no bundler, no build step. Keep it that way unless there is a strong reason.
Files are served as-is by GitHub Pages (branch `main`, root).

## Add a new day of worksheets (most common job)

1. Create `data/units/<unit-id>.json` with `"app": null` (or content for an activity) and a `"print"` block.
   Existing `print.kind` values: `math-add`, `math-mul`, `eng-blend`. Copy the closest unit and change the content.
2. Add it to `data/plan.json` under `weeks → <week number> → <mon|tue|wed|thu|fri> → { "maths": "<unit-id>", "english": "<unit-id>" }`.
3. Open `print/index.html#<week>-<day>`, check both pages (maths front, English back) and print one to be sure.
4. `npm run pdfs` to (re)write `worksheets/<week>-<day>.pdf`: the app's day card links to it for download and printing.
5. `npm test`. The test generates a check per planned day: no text may overflow a card or section, and the PDF must exist.

If the content needs a new kind of page (for example subtraction or digraphs), add a builder in `print/print.js` and register it in `KINDS`.
`legacy/math-subtraction-back-through-10.html` and `legacy/math-times-tables.html` already contain picture code and content to reuse.

## Add a new interactive activity

1. Add `src/activities/<name>.js` (copy `jump-through-10.js`). Steps are keys in `R`; the engine shows `intro` first and `end` last.
   Use `setPrompt(text)` for the spoken prompt (the 🔊 button repeats it) and `setOK()` when the step is complete. Mark game steps with `games:[…]`.
2. Put its content in the unit's `"app"` block and read it through `data`. Do not hard-code numbers or words in the module.
   The block needs `id` (progress key: never rename), `module`, `title`, `tag`, `art`, `intro`, `end`.
   New content for an existing module needs no code: just a unit with an `"app"` block, listed in `plan.json`.
3. Register a new module in `MODULES` in `src/app.js`.
   The home page is an illustrated map from START (top) to the castle (bottom), one stone per day. A day opens only when
   both activities of the day before it are finished
   (grown-ups can switch on "Unlock every step" in settings). A subject with `"app": null` counts as done (paper only).
4. Add a play-through test to `tests/smoke.spec.js` (tap only correct answers).

## Planned content (Term 4 and beyond)

- Maths: times tables one table at a time (2, 5, 10, 3, 4, 6, 7, 8, 9, mixed). Addition/subtraction fluency (jump through 10, back through 10, then tens and ones, mixed word problems).
- English: consonant blends, digraphs (sh, ch, th), common words, short sentences, writing a sentence, a four-sentence story.
- A 5-minute thinking game each day (patterns, odd one out, simple logic). Long-term aim: selective high school, which includes writing, so protect writing practice.

## Working agreements

- Test before you push: `npm install && npx playwright install chromium && npm test`.
- Deploy = push to `main`. GitHub Pages republishes in about a minute, at the same URL. Progress stars are stored per device in `localStorage` under the key `hq-v1`, so do not change the URL or the key casually.
- Keep `index.html` working offline-friendly: no CDN scripts. Fonts are the only external request (Google Fonts); self-hosting them is a welcome improvement.
- Ask before adding anything that collects data, needs a login, or shows ads. The answer is almost certainly no.
