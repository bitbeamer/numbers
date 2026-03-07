# Zahlenliebe

Zahlenliebe is a local-first learning web app for children.
It teaches:
- number bonds ("verliebte Zahlen")
- carrying in addition ("Übertrag")
- fast mental arithmetic rounds

The UI language is German, while the source code is English.

## Tech Stack

- React 19
- Vite 7
- TypeScript
- React Router
- localStorage persistence only (no backend)
- Vitest + Testing Library for basic tests

## Features

- `/` Home with mode selection
- `/mode/love10` Drag and drop cards, target sum depends on selected number range
- `/mode/placevalue` A large number is shown, then children click the count of tens and ones
- `/mode/carry` Place-value board with bundling `10 ones -> 1 ten` and hints
- `/mode/sprint` 60-second mode with large answer buttons and combo scoring
- `/progress` Last 7 days, per-mode stats, top error patterns
- `/settings` Sound, difficulty, UI scale, number range, avatar/name, data reset

## Number Range Setting

In **Settings -> Spiel -> Zahlenraum**, you can choose:
- `bis 10`
- `bis 25`
- `bis 50`
- `bis 100`

This setting is used by all game generators.

## Adaptive Difficulty

Adaptive mode uses the last 20 tasks:
- high accuracy + fast average time -> harder tasks
- low accuracy -> easier tasks + more hints
- many `carry_missed` errors -> more carry-focused tasks

## Local Persistence

Storage keys:
- main: `zahlenliebe:v1`
- backup: `zahlenliebe:v1:backup`

Core persistence utilities are in:
- `src/state/persistence.ts`
  - `loadState()`
  - `saveState(state)`
  - `updateProfile(profileId, patch)`
  - `recordTaskResult(input)`

## Run Locally

```bash
npm install
npm run dev
```

Open the shown localhost URL (default: `http://localhost:5173`).

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run lint      # eslint
npm run test      # vitest (watch)
npm run test:run  # vitest run once
```

## Basic Test Coverage

- persistence load/save/fallback behavior
- profile/task recording logic
- adaptive-plan behavior
- router smoke tests
- generator number-range constraints

## Project Structure

```txt
src/
  app/
  components/
  game/
    generators/
  pages/
  state/
  styles/
  test/
```
