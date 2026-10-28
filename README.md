# OpenTetris

A browser Tetris game with a Guideline-style modern mode and an NES-inspired classic mode. Gameplay, high scores, and settings stay in the browser. Live demo: [opentetris.vercel.app](https://opentetris.vercel.app/).

## Features

- 10×20 playfield and the seven tetrominoes (I, O, T, S, Z, J, L)
- Modern mode: 7-bag randomizer, 3-piece next queue, hold, ghost piece, SRS clockwise rotation with wall kicks, modern scoring and drop bonuses
- Classic mode: NES reroll randomizer, queued 1-piece preview, NES scoring, NES gravity table, NES DAS, no wall kicks, line-clear animation, and the NES first level transition (`(start + 1) × 10` lines, then every 10)
- Keyboard controls, including reset from the game-over screen, plus tap controls below 768px
- High score and settings in `localStorage` (`tetris-highscore`, `tetris-settings`), with corrupt values ignored and the higher score kept across tabs
- Hold is refused when the incoming piece would spawn inside the stack
- Security headers on every route: `nosniff`, `DENY` framing, and a Content-Security-Policy with `frame-ancestors 'none'`
- Pages: `/` (game) and `/about`
- No accounts, API routes, server actions, database, or payment integration

## Tech stack

| Area | Package | Range |
| --- | --- | --- |
| Framework | `next` | ^16.4.3 |
| UI | `react`, `react-dom` | ^19.3.1 |
| Compiler (`tsc`) | `@typescript/native` (`npm:typescript`) | ^7.0.2 |
| TypeScript API for ESLint and Next | `typescript` (`npm:@typescript/typescript6`) | ^6.0.2 |
| Node types | `@types/node` | ^26.6.6 |
| Styling | `tailwindcss`, `@tailwindcss/postcss` | ^4.3.3 |
| Icons | `lucide-react` | ^1.63.0 |
| Variants | `class-variance-authority` | ^0.7.1 |
| Lint | `eslint`, `eslint-config-next` | ^10.13.0, ^16.4.3 |
| Tests | Node test runner via `tsx` | ^4.23.15 |

TypeScript 7 does not ship a JavaScript compiler API. `typescript-eslint` still imports `typescript`, so that name is aliased to `@typescript/typescript6`. `npm run typecheck` runs TypeScript 7’s `tsc`.

## Project structure

```
src/
  app/                  # layout, /, /about
  components/tetris/    # board, HUD, controls, settings
  components/ui/
  hooks/                # useTetris, keyboard, DAS, interval, mobile
  lib/                  # rules, storage, headers, tests
  types/
.github/workflows/ci.yml
spec.md
roadmap.md
```

## Getting started

### Prerequisites

- Node.js 22 (the version CI uses) or a current LTS
- npm

### Install

```bash
git clone https://github.com/brown2020/opentetris.git
cd opentetris
npm install
```

### Environment variables

No secrets and no `.env` file. The only variable the app reads is `NODE_ENV`, which Node and Next.js set. `next dev` uses it to loosen the Content-Security-Policy for the dev server. `next build` and `next start` do not need any secret to succeed.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Controls

| Input | Action |
| --- | --- |
| ← / → or A / D | Move (DAS). Releasing one alias keeps moving while the other is held. |
| ↓ or S | Soft drop |
| ↑ or W | Rotate clockwise |
| Space | Hard drop in modern mode. One cell down in classic mode. |
| C | Hold (modern mode, and only when the spawn fits) |
| P | Pause or resume |
| R | Reset, including from the game-over screen |

Ctrl, Cmd, and Alt chords are ignored, as are keys aimed at buttons and fields.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint on `src/` |
| `npm run typecheck` | `tsc --noEmit` (TypeScript 7) |
| `npm test` | Node tests via `tsx` |
| `npm run doctor` | Optional scan with pinned `react-doctor@0.9.18` |

## Testing and CI

Tests live next to the rules they cover: scoring and classic level curve, SRS rotation, NES next queue, hold collision, settings updates, storage, keyboard guards, route absence, and security headers.

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, lint, typecheck, test, and build on `dev` and `main` with Node 22. The workflow does not use secrets.

## Deployment

Standard Next.js deploy. The public demo is [opentetris.vercel.app](https://opentetris.vercel.app/). There is no `vercel.json` and no Firebase project.

## Contributing

1. Branch from `dev`.
2. Run lint, typecheck, and tests before opening a PR.
3. Keep scoring and gravity changes in `src/lib` so the unit tests can cover them.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
