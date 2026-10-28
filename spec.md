# OpenTetris spec

What the app does today. This is the built behavior, not a wishlist.

## Product

OpenTetris is a client-only Next.js App Router game. `/` renders the board. `/about` is a static explanation. There are no API routes, server actions, accounts, or databases. A request to `/api/*` is a Next.js 404.

The production build does not read secrets. `NODE_ENV` is the only environment variable, and it only selects a stricter or looser Content-Security-Policy.

## Modes

The settings panel offers two presets. Switching mode starts a new round and keeps the high score. Changing the starting level while paused updates the displayed level and the drop speed without clearing the board.

| | Modern (default) | Classic |
| --- | --- | --- |
| Randomizer | 7-bag | NES: one reroll if the new piece matches the previous |
| Next queue | 3, and the queue is what spawns | 1, and the queue is what spawns |
| Hold | On. Refused if the spawn collides. | Off |
| Ghost | On | Off |
| Rotation | SRS, clockwise, with wall kicks | Clockwise, no kicks |
| Scoring | 100 / 300 / 500 / 800 × level. Soft drop +1 per cell. Hard drop +2 per cell. | 40 / 100 / 300 / 1200 × (level + 1). No drop points. |
| Level | Every 10 lines, added to the start level | Stay on the start level until `(start + 1) × 10` lines, then every 10 |
| Gravity | `max(100, 1000 - (level - 1) × 50)` ms | NES frame table converted at 60fps (800ms at level 0 down to 17ms at level 29+) |
| Line clear | Instant | 8×50ms flash, then the lines clear and the queued piece spawns |
| Hard drop | Instant lock at the ghost | One cell down, no lock |
| Theme | Modern Tailwind colors | NES level palette |
| Start level in the panel | 1–10 | 0–9 |
| Statistics | Hidden | Piece counts |

The renderer also has a Game Boy palette. The panel never selects it; only a stored `colorTheme` of `gameboy` would show it.

Stored settings are merged onto the preset for the saved mode. Unknown fields are dropped. `nextPieceCount` must be 1 or 3. Starting level is clamped to 0–19 in classic and 1–15 in modern. A non-finite level or score becomes the default or 0.

## Board and pieces

- Visible field is 10 columns by 20 rows. Pieces may occupy rows above the field while rotating.
- Spawn uses the SRS bounding boxes. O is centered and does not move when rotated. J, L, S, Z, and T rotate inside the top-left 3×3. I uses the 4×4 SRS poses.
- A piece locks when gravity, or a downward move, cannot step down. There is no lock delay.
- Top-out is checked when the next piece spawns. The overlapping piece is not written into the board.
- Soft drop scores only when the piece actually moves, and it does not lock by itself.
- DAS: modern 170ms then 50ms; classic 267ms then 100ms. The repeat stops when every key for that direction is up, or the window blurs.

## Input

- Move: Arrow keys or A/D. Soft drop: Down or S. Rotate: Up or W. Hard drop: Space. Hold: C. Pause: P. Reset: R.
- Modifier chords do nothing. Keys whose target is a button, link, or field do nothing, so Space can activate a focused button.
- On game over, R starts a new game and P is ignored by the reducer. Movement keys do not play.
- Below 768px, on-screen buttons move, rotate, soft-drop, and hard-drop. They are single taps.

## Persistence

| Key | Contents |
| --- | --- |
| `tetris-highscore` | Integer score. Non-numeric, blank, and negative values are read as 0. |
| `tetris-settings` | JSON settings object. Invalid JSON falls back to modern defaults. |

Writes happen in effects, not in the reducer, and ignore quota or security errors from `localStorage`. On game over the saved value is `max(this score, the value already stored)`. A `storage` event raises the in-memory high score and never lowers it. An in-progress score is discarded on refresh.

## HTTP

`next.config.ts` sends these headers for `/:path*`:

- `Content-Security-Policy` with `default-src 'self'` and `frame-ancestors 'none'`. Development adds the dev-server websocket and `unsafe-eval`.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with camera, microphone, and geolocation disabled

## Verification

`npm test` covers scoring, the classic level curve, rotation coordinates, the NES queue, hold collision, settings updates, storage parsing, the cross-tab high-score max, keyboard guards, the absence of route handlers, and the security headers. CI runs lint, typecheck, test, and build with no secrets.
