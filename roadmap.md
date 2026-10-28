# OpenTetris roadmap

Punchlist after the dependency and rules pass on `dev`. Nothing here is a secret, a deployment, or a model change.

## Next

1. Move `typescript-eslint` onto the TypeScript 7 API when [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940) lands, then drop the `@typescript/typescript6` alias. Until then, `tsc` is 7 and ESLint imports TypeScript 6.
2. Enforce `docs/runtime-budget.txt` (static JS ≤ 900KB) in CI, or delete the budget if it is no longer a goal.
3. Add a browser test for one full round: spawn, rotate, hard drop, line clear, pause, game over, and R to restart. Unit tests do not mount the React tree.
4. Expose the Game Boy palette in the settings panel. The renderer already supports `colorTheme: "gameboy"`.
5. Give mobile buttons press-and-hold DAS. Taps only move one cell today.
6. Pin `actions/checkout` and `actions/setup-node` to commit SHAs when the Actions policy is tightened.

## Known limits

- Pieces lock on the gravity tick that cannot move down. There is no lock delay, entry delay, or counterclockwise / 180 rotation.
- Classic Space and the mobile “hard drop” button move one cell and do not lock. The on-screen label still says hard drop.
- NES gravity is a `setInterval`, so it is not locked to a 60Hz frame clock. The millisecond table matches the NES frame counts, but browser timer clamping can make level 29 slower or less steady than one frame.
- The high score is written at game over. Quitting mid-round drops a score that has not been saved yet.
- Another tab’s settings are last-write-wins. Only the high score is merged by max.
- The game-over overlay is not a focus-trapped dialog. R works; keyboard users can also tab to Play Again.
- `npm run doctor` still downloads pinned `react-doctor@0.9.18` through `npx` instead of a lockfile dependency. It is not part of CI.
- `docs/architecture.md` still describes the old in-reducer `saveHighScore` helper. `spec.md` is the current description.

## Not in this repo

- No open GitHub issues were filed from this pass.
- No Firebase rules, indexes, or deploys.
- No Vercel project settings or environment variables to change. The app has no secret names to add.
- Promotion from `dev` to `main` is a separate QA step.
