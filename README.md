# OpenTetris

A modern open-source Tetris clone for the browser. Play Guideline-style “modern” mode or NES-inspired “classic” mode, with hold, next queue, ghost piece, DAS, and local high-score / settings persistence. Live demo: [opentetris.vercel.app](https://opentetris.vercel.app/).

## Features

Verified from the current codebase:

- 10×20 playfield with I, O, T, S, Z, J, L pieces
- Modern mode (7-bag randomizer, modern scoring, hold, hard drop points) and classic/NES mode (NES random, gravity table, NES scoring)
- Soft drop, hard drop, rotate, hold (C), pause (P), reset (R); arrow keys / WASD
- Delayed Auto Shift (DAS) for horizontal movement; settings differ by mode
- Ghost piece, next-piece preview, hold preview, piece statistics, line-clear animation
- On-screen mobile controls (`useIsMobile`)
- High score and game settings stored in `localStorage`
- About page at `/about`
- React `useReducer` game loop (`useTetris`) — no Zustand, no backend

## Tech stack

| Area | Choice | Version (package.json) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.3.6 |
| UI | React | ^19.3.0 |
| Language | TypeScript | ^6.0.3 |
| Styling | Tailwind CSS + `@tailwindcss/postcss` | ^4.3.3 |
| Icons / CVA | Lucide, class-variance-authority | — |
| State | React `useReducer` + hooks | — |
| Lint / test | ESLint 10, Node test runner + `tsx` | — |

No Firebase, AI, payments, or environment variables required.

## Project structure

```
src/
  app/
    page.tsx                 # TetrisGame + About link
    about/page.tsx
    layout.tsx
  components/tetris/         # Board, Score, Next, Hold, Controls, Settings, …
  components/ui/
  hooks/                     # useTetris, useKeyboard, useDAS, useInterval, useIsMobile
  lib/                       # constants, utils (scoring, collision, bags), tests
  types/
docs/
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI) or a current LTS
- npm

### Clone and install

```bash
git clone https://github.com/brown2020/opentetris.git
cd opentetris
npm install
```

### Environment variables

None. There is no `process.env` usage and no `.env` template.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Controls

| Input | Action |
| --- | --- |
| ← / → or A / D | Move (with DAS) |
| ↓ or S | Soft drop |
| ↑ or W | Rotate |
| Space | Hard drop |
| C | Hold |
| P | Pause |
| R | Reset |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node tests via `tsx` |
| `npm run doctor` | Optional `react-doctor` scan |

## Testing and CI

- Tests: `src/lib/scoring.test.ts`, `src/lib/routes.test.ts`.
- CI: install, lint, typecheck, test, build on `dev`/`main` (Node 22). No secrets.

## Deployment

Standard Next.js deploy (demo: [opentetris.vercel.app](https://opentetris.vercel.app/). No `vercel.json` or Firebase config.

## Contributing

1. Branch from `dev`.
2. Run lint, typecheck, and tests before opening a PR.
3. Prefer changes to `constants.ts` / pure utils for scoring and gravity so unit tests stay meaningful.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
