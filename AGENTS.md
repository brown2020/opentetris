# Repository Guidance

## Project Snapshot

OpenTetris is a Next.js App Router browser Tetris game in TypeScript. Gameplay
is client-side: `src/components/tetris/TetrisGame.tsx` composes board, HUD, and
controls. State lives in `src/hooks/useTetris.ts` (useReducer). Pure helpers are
in `src/lib/utils.ts` and `src/lib/constants.ts`. High scores and settings
persist in localStorage only. There is no auth and no server mutation API.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run doctor
```

## Architecture Notes

- `src/app/layout.tsx` owns metadata and viewport (zoom unlocked).
- `src/hooks/useTetris.ts` is the central mutation boundary.
- Keep `src/lib/utils.ts` framework-free for unit tests.
- Never inline `NEXT_PUBLIC_*` or API keys in `.github/workflows/*` — use
  `${{ secrets.* }}` only; gate jobs must tolerate missing secrets.
- Do not name non-hooks `use*`.

## Auth

Not applicable — no email/password surfaces.
