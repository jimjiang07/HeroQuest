# Hero Quest architecture

Vue 3 + Vite + TypeScript, Pinia for progress, Vue Router (hash mode). Static build, deployed to GitHub Pages by
`.github/workflows/deploy.yml`. The users are young children: **every screen fits without scrolling and shows only a few
big things at once** (tested at phone 390×844 and tablet 820×1180).

## Flow

Who's playing (`/who`, `/new`) → choose a quest (`/hub`) → the quest's map (`/quest/:id`) → a step (`/play/:id/:step`)
or the paper quest (`/quest/:id/paper`).

Each quest is one skill with 5 steps and a boss: **learn** (the activity's own learning steps) → **help** (shared practice,
help levels 1–2) → **own** (shared practice, adaptive help 1–4) → **game** (the activity's games) → **paper** (print the
quest's sheet; a grown-up press-and-holds to confirm) → **boss** (shared, no pictures, said aloud first). Beating the boss
= Growing; a rematch won on a later day = Secure.

## Where things live

| Path | What |
|---|---|
| `data/quests.json` | The quests in picker order: `unit`, `subject`, `art` (a quest item), `boss {name, art}`, `map {scene, path}` (the quest map's scene and stone spots), `needs` (quest ids) |
| `data/units/<unit>.json` | `app`: content for the app (`id` = progress key, never rename; `module`; `title`; `intro`; `quest`; `practice`; plus the module's own keys). `print`: content for the quest's worksheet |
| `src/types.ts` | Shared types: `UnitApp`, `Question`, `Choice`, `ActivityModule`, `QuestDef` |
| `src/learn/` | Pure logic, unit-tested: `adapt.ts` (help ladder), `gen.ts` (seeded generators), `learner.ts` (heroes, progress, skill status) |
| `src/stores/progress.ts` | Pinia store over the learner state; saved to localStorage `hq-v1` (old saves migrate) |
| `src/services/audio.ts` | `sfx` (incl. the boss growl, zap and defeat), `say`, `confetti`, `shake`, `sleep` |
| `src/voice/`, `public/voice/` | The recorded voice: `say` plays one clip per sentence (`clips.ts` names them), falling back to the device voice for anything not recorded. `lines.ts` lists every line built from quest content; `say.ts` holds the lines screens build from quest names |
| `scripts/make-voice.mjs` | Records `public/voice/` with Natasha (en-AU) through edge-tts (`npm run voice`, needs `uv`). Also picks up fixed sentences quoted in `src/` |
| `src/components/run/` | `StepRunner` (intro → steps → end, footer Back/speaker/Next), `PracticeStep`, `BossStep`, `QuestionCard`, `ReadTicks` |
| `src/activities/<module>/` | One activity module: `index.ts` exports `{ask, lines, steps}`; step components; `ask.ts`; `speech.ts` (what its steps say, and `lines(data)` listing it all) |
| `src/activities/common/` | `pics.ts` (picture HTML), `MemoryGame.vue`, `BalloonGame.vue` |
| `src/views/` | The screens |
| `src/heroes.ts` | The starter heroes and worlds, and `art(name)` → `art/<name>.svg` |
| `src/components/Icon.vue`, `HeroAvatar.vue` | Doodle UI icons; a hero (`full` for the whole body) |
| `scripts/make-art.mjs` | Draws every SVG in `public/art/` and the contact sheet `docs/art-kit.html` (`npm run art`). Style: `docs/art-style.md` |
| `print/` | Worksheet page (`print/index.html#<quest id>`), a second Vite entry |
| `public/worksheets/quests/<quest id>.pdf` | Pre-made sheets (`npm run pdfs`) |

## An activity module

```ts
export default {ask, lines, steps:{fill:FillTen, trick:TrickHop, read:ReadSums, memory:..., balloon:...}} satisfies ActivityModule;
```

- **Steps** are components with prop `data: UnitApp`. Inside, `const run=useRun()`:
  `run.setPrompt(text)` (spoken; the speaker button repeats it), `run.onNext(fn)` (Next shows the next question by calling fn),
  `run.setOK()` (step complete). Wrong taps: `shake(el)` + "Try again!"; never a buzzer, never a timer.
- **`ask(item, help, data) → Question`** describes one practice/boss question. Help: 1 labelled picture, 2 picture,
  3 no picture, 4 stretch (missing number, spelling…). The shared `PracticeStep` and `BossStep` draw it, record the answer
  and move along the help ladder. `answer` must equal one choice's `v`; `say` must not give the answer away.
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

- No scrolling inside a screen. Long lists page a few at a time (`ReadTicks` does this). Keep pictures sized with the
  `--v` unit (`min(1vw, .72vh)`), and cap counts (e.g. at most ~30 dots in a picture).
- One question, one picture, 2–4 big answer buttons (64px+ on tablets, 56px+ on phones).
- Australian English, sentence case, `’` in readable text. Wrong answers are gentle. No timers.
- Doodle art and `<Icon>` only, never emoji in the UI; colours come from the palette tokens in `app.css` (`docs/art-style.md`).
- Tests can read the right answer from `.qwrap[data-a]` (children never see it).
