# Architecture

## Map

```
Browser
  └─ Next.js App Router (static /, /about)
       └─ page.tsx → TetrisGame (client)
            ├─ Board / Score / Next / Hold / Controls / Settings
            ├─ useTetris (useReducer) + useKeyboard + useInterval + useDAS
            └─ localStorage: tetris-highscore, tetris-settings
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_reset_game | board, piece, score, gameState | `RESET_GAME` / `INIT` in useTetris | in-memory (+ high score load) |
| move_rotate_piece | currentPiece position/rotation | MOVE_PIECE / ROTATE_PIECE | in-memory |
| hard_soft_drop | piece y + score bonuses | HARD_DROP / SOFT_DROP | in-memory |
| pause_game | gameState PLAYING↔PAUSED | TOGGLE_PAUSE | in-memory |
| persist_high_score | highScore | saveHighScore on game over | localStorage only |

No server cache. Reload restores high score and settings from localStorage; live board state is discarded.

## Server / client

All interactive gameplay is client (`"use client"`). `/about` is a Server Component page. No route handlers or server actions. Unauthorized `/api/*` returns Next 404 — there is no privileged mutation surface.

## Change exercises

1. **Data:** change `MODERN_POINTS` / `NES_POINTS` in `src/lib/constants.ts` — `calculateScore` / `getDropPoints` and unit tests update; UI unchanged.
2. **Access:** adding a future `/api/scores` would require a new route file and explicit auth; today access is "everyone mutates local state; nobody mutates server state" proven by absent routes + 404.
