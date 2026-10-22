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
| `data/quests.json` | The quests in picker order: `unit`, `subject`, `art`, `boss {name, emoji}`, `needs` (quest ids) |
| `data/units/<unit>.json` | `app`: content for the app (`id` = progress key, never rename; `module`; `title`; `intro`; `quest`; `practice`; plus the module's own keys). `print`: content for the quest's worksheet |
| `src/types.ts` | Shared types: `UnitApp`, `Question`, `Choice`, `ActivityModule`, `QuestDef` |
| `src/learn/` | Pure logic, unit-tested: `adapt.ts` (help ladder), `gen.ts` (seeded generators), `learner.ts` (heroes, progress, skill status) |
| `src/stores/progress.ts` | Pinia store over the learner state; saved to localStorage `hq-v1` (old saves migrate) |
| `src/services/audio.ts` | `sfx`, `say` (en-AU voice), `confetti`, `shake`, `sleep` |
| `src/components/run/` | `StepRunner` (intro → steps → end, footer Back/🔊/Next), `PracticeStep`, `BossStep`, `QuestionCard`, `ReadTicks` |
| `src/activities/<module>/` | One activity module: `index.ts` exports `{subject, ask, steps}`; step components; `ask.ts` |
| `src/activities/common/` | `pics.ts` (picture HTML), `MemoryGame.vue`, `BalloonGame.vue` |
| `src/views/` | The screens |
| `print/` | Worksheet page (`print/index.html#<quest id>`), a second Vite entry |
| `public/worksheets/quests/<quest id>.pdf` | Pre-made sheets (`npm run pdfs`) |

## An activity module

```ts
export default {subject:'maths', ask, steps:{fill:FillTen, trick:TrickHop, read:ReadSums, memory:..., balloon:...}} satisfies ActivityModule;
```

- **Steps** are components with prop `data: UnitApp`. Inside, `const run=useRun()`:
  `run.setPrompt(text)` (spoken; 🔊 repeats it), `run.onNext(fn)` (Next shows the next question by calling fn),
  `run.setOK()` (step complete). Wrong taps: `shake(el)` + "Try again!"; never a buzzer, never a timer.
- **`ask(item, help, data) → Question`** describes one practice/boss question. Help: 1 labelled picture, 2 picture,
  3 no picture, 4 stretch (missing number, spelling…). The shared `PracticeStep` and `BossStep` draw it, record the answer
  and move along the help ladder. `answer` must equal one choice's `v`; `say` must not give the answer away.
- **Practice items** come from `data.practice = {gen, levels}`; `gen` is one of `add10 | groups | arrays | words`
  (`src/learn/gen.ts`), and each level is that generator's params (difficulty rises through the levels).
- `data.quest = {learn:[step keys], game:[step keys], help, own, boss}` picks which steps make "Learn it" and "Game" and
  how many questions the shared steps ask.
- Register the module in `src/activities/index.ts`. A new quest that reuses a module is data only: a unit file plus a
  line in `data/quests.json`.

## Rules every screen follows

- No scrolling inside a screen. Long lists page a few at a time (`ReadTicks` does this). Keep pictures sized with the
  `--v` unit (`min(1vw, .72vh)`), and cap counts (e.g. at most ~30 dots in a picture).
- One question, one picture, 2–4 big answer buttons (64px+ on tablets, 56px+ on phones).
- Australian English, sentence case, `’` in readable text. Wrong answers are gentle. No timers.
- Tests can read the right answer from `.qwrap[data-a]` (children never see it).
