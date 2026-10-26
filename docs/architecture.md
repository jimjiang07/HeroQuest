# Hero Quest architecture

Vue 3 + Vite + TypeScript, Pinia for progress, Vue Router (hash mode). Static build, deployed to GitHub Pages by
`.github/workflows/deploy.yml`. The users are young children: **every screen fits without scrolling and shows only a few
big things at once** (tested at phone 390×844 and tablet 820×1180).

## Flow

Who's playing (`/who`, `/new`) → the **term map** (`/term`: 20 stones, one per session, 5 lands) → a stone's session
(`/session/:n`: its 9 steps) → a step (`/sp/:n/:key`) → the item reveal → back to the session. The term map also opens
the wardrobe (`/wardrobe`, with the play area `/play-area`) and **More quests** (`/hub` → `/quest/:id` →
`/play/:id/:step`), the older one-skill quests, each with an optional worksheet.

### Term sessions

- `data/term/2026-t4.json`: the stones and what each holds (`warmup`, `maths`, `english`, `think`: unit ids), the lands and
  the minutes guide. `src/term.ts` reads it (`stoneDef` puts a grown-up's `st.plan` on top; Grown-ups > Plan edits it).
- A session's steps, in order: `warmup` (practice on the warm-up quest) · `learn`, `training` (help then own), `game`,
  `boss` on the maths quest · `read`, `words`, `infer` on the English unit (`read` module) · `think` (the `think` module's
  game). `SessionPlayView` builds each as a `StepRunner` run and marks both the session step and the matching quest steps.
  Maths units used by the term are quests with `"term": true` in `data/quests.json` (left out of More quests).
- Rewards: `data/rewards.json` gives each stone's item per step, its medium item and every 4th stone's chest (big item +
  land scene), plus the thinker badges. `itemsWon` / `newItems` / `nextItem` (`src/learn/learner.ts`) work them out from
  progress, so nothing is stored that could be lost. `RewardReveal` plays at the end of a step and holds Next until it ends.
- Items are drawn on the hero rig: `src/art/wear.js` (twelve slots, `dressAll`, `heroFullSvg`, `itemSvg`) and
  `src/art/items/*.js`. The approved catalogue and unlock order: `docs/rewards-catalogue.png`, `docs/rewards-order.png`.
- Backup: Grown-ups > Heroes has the file backup and a copy-paste code (`src/services/backup.ts`, `HQ1-…`).

Each quest is one skill with 5 steps and a boss: **learn** (the activity's own learning steps) → **help** (shared practice,
help levels 1–2) → **own** (shared practice, adaptive help 1–4) → **game** (the activity's games) → **challenge** (shared,
the module's `challenge()`: maths story problems, english spelling with letter tiles) → **boss** (shared, no pictures, then a
bonus stretch question). Beating the boss = Growing and wins its first gear piece; a rematch won on a later day = Secure
and wins the second.

The child plays alone, so every step checks a real answer: nothing is "say it out loud" or ticked off. Answers are hidden
and Next is off until the voice has read the question.

## Where things live

| Path | What |
|---|---|
| `data/quests.json` | The quests in picker order: `unit`, `subject`, `art` (a quest item), `boss {name, art}`, `map {scene, path}` (the quest map's scene and stone spots), `needs` (quest ids) |
| `data/units/<unit>.json` | `app`: content for the app (`id` = progress key, never rename; `module`; `title`; `intro`; `quest`; `practice`; plus the module's own keys). `print`: content for the quest's worksheet |
| `src/types.ts` | Shared types: `UnitApp`, `Question`, `Choice`, `ActivityModule`, `QuestDef` |
| `src/learn/` | Pure logic, unit-tested: `adapt.ts` (help ladder), `gen.ts` (seeded generators), `learner.ts` (heroes, progress, skill status) |
| `src/stores/progress.ts` | Pinia store over the learner state; saved to localStorage `hq-v1` (old saves migrate) |
| `src/services/audio.ts` | `sfx` (incl. the boss growl, zap and defeat), `say(text, done)` (done fires once: ended, failed or cut off), `talking`, `confetti`, `shake`, `sleep` |
| `src/voice/`, `public/voice/` | The recorded voice: `say` plays one clip per sentence (`clips.ts` names them), falling back to the device voice for anything not recorded. `lines.ts` lists every line built from quest content; `say.ts` holds the lines screens build from quest names |
| `scripts/make-voice.mjs` | Records `public/voice/` with Natasha (en-AU) through edge-tts (`npm run voice`, needs `uv`). Also picks up fixed sentences quoted in `src/` |
| `src/components/run/` | `StepRunner` (intro → steps → end, footer Back/speaker/Next; Next waits for the voice), `PracticeStep`, `ChallengeStep`, `BossStep`, `QuestionCard` (choices, `NumPad` or `Speller`), `LearnCards` (see a card, then answer a check on it) |
| `src/activities/<module>/` | One activity module: `index.ts` exports `{ask, lines, steps}`; step components; `ask.ts`; `speech.ts` (what its steps say, and `lines(data)` listing it all) |
| `src/activities/common/` | `pics.ts` (picture HTML), `MemoryGame.vue`, `BalloonGame.vue` (balloons appear after the voice) |
| `src/views/` | The screens |
| `src/heroes.ts` | The starter heroes and worlds, and `art(name)` → `art/<name>.svg` |
| `src/components/Icon.vue`, `HeroAvatar.vue` | Doodle UI icons; a hero (`full` for the whole body) |
| `scripts/make-art.mjs` | Draws every SVG in `public/art/` and the contact sheet `docs/art-kit.html` (`npm run art`). Style: `docs/art-style.md` |
| `print/` | Worksheet page, a second Vite entry: `#<quest id>` (one sheet per quest), `#stone-<n>-maths` / `#stone-<n>-english` (double-sided session sheets; maths content in `data/print/stone-<n>-maths.json`, English from the stone's reading unit), `#term-map`, `#stickers` |
| `public/worksheets/quests/<quest id>.pdf`, `public/worksheets/term/` | Pre-made sheets (`npm run pdfs`) |

## An activity module

```ts
export default {ask, lines, steps:{fill:FillTen, trick:TrickHop, read:ReadSums, memory:..., balloon:...}} satisfies ActivityModule;
```

- **Steps** are components with prop `data: UnitApp`. Inside, `const run=useRun()`:
  `run.setPrompt(text)` (spoken; the speaker button repeats it; `run.listening` stays true until it has been read, so hide
  answers until then), `run.onNext(fn)` (Next shows the next question by calling fn), `run.setOK()` (step complete).
  Wrong taps: `tryAgain(el,msg)` (a gentle shake + "Try again!"); never a buzzer, never a timer.
- **`ask(item, help, data) → Question`** describes one practice/boss question. Help: 1 labelled picture, 2 picture,
  3 no picture, 4 stretch (missing number, spelling…). The shared `PracticeStep` and `BossStep` draw it, record the answer
  and move along the help ladder. Maths questions set `pad:true` (typed on the number pad, `choices:[]`); spelling sets
  `spell:{word,mark}` (letter tiles); otherwise `answer` must equal one choice's `v`. `say` must not give the answer away.
- **`challenge(item, data, worked) → Question`** is step 5. It must be a pure function of its arguments (no random
  choices), because `lines.ts` lists every challenge line for recording. `worked` = the child is stuck: add the picture.
- **Practice items** come from `data.practice = {gen, levels}`; `gen` is one of `add10 | groups | arrays | words`
  (`src/learn/gen.ts`), and each level is that generator's params (difficulty rises through the levels).
- `data.quest = {learn:[step keys], game:[step keys], help, own, boss}` picks which steps make "Learn it" and "Game" and
  how many questions the shared steps ask.
- **Spoken lines** built from data live in the module's `speech.ts`, and `lines(data)` returns all of them so
  `npm run voice` can record them. Fixed sentences can stay inline: the script finds quoted text in `src/`. A line with no
  clip still plays in the device voice, but the e2e tests fail on it (`[voice]` warning).
- Register the module in `src/activities/index.ts`. A new quest that reuses a module is data only: a unit file plus a
  line in `data/quests.json`.

## Rules every screen follows

- No scrolling inside a screen. Long lists go one card at a time (`LearnCards` does this). Keep pictures sized with the
  `--v` unit (`min(1vw, .72vh)`), and cap counts (e.g. at most ~30 dots in a picture).
- One question, one picture, 2–4 big answer buttons (64px+ on tablets, 56px+ on phones).
- Australian English, sentence case, `’` in readable text. Wrong answers are gentle. No timers.
- Doodle art and `<Icon>` only, never emoji in the UI; colours come from the palette tokens in `app.css` (`docs/art-style.md`).
- Tests can read the right answer from `.qwrap[data-a]` (children never see it); `answer(page)` in `tests/e2e/helpers.ts`
  taps, types or builds it once the voice is done. Tests play the voice at rate 4; `HQ_PORT=<port>` runs a separate build
  on its own port, and `HQ_NEW_LINES=1` skips the missing-clip check until `npm run voice` has recorded new lines.
