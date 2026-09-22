# Runtime budget

Stated before measurement (until-100 leanness):

- **Budget:** sum of `.next/static/**/*.js` bytes after `npm run build` **≤ 900 KB**.
- **Critical path:** `start_reset_game` / play loop on `/`.
- Measure locally after production build; record bytes and pass/fail.
