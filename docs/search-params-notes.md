# Search params design notes — players & games filters

## Players (`/players`)
- Schema: `validatePlayersSearch` in `src/lib/searchSchemas.ts`
- Keys:
  - `position` — one of `F` | `D` | `G`, optional. Any other/missing value
    falls back to `undefined` ("any position").
  - `status` — one of `active` | `ir` | `all`. Any other/missing value
    falls back to `"all"`.
- Bad input handling: unknown keys are ignored; invalid values for a known
  key fall back to that key's default. The validator never throws, so a
  garbage query string never crashes the page — worst case it behaves like
  no filter was applied.
- Example bookmark URL: `/players?position=F&status=active`

## Games (`/games`)
- Schema: `validateGamesSearch` in `src/lib/searchSchemas.ts`
- Keys:
  - `team` — free-text team code, trimmed and upper-cased; empty/missing
    falls back to `undefined` ("any team"). No fixed team list yet since
    real rosters/schedules arrive in a later sprint.
  - `date` — a plain `YYYY-MM-DD` string; anything that doesn't match that
    shape falls back to `undefined` ("any date"). No calendar widget or
    range filtering this sprint.
- Bad input handling: same pattern as players — unknown keys ignored,
  invalid values fall back to "no filter," never a crash.
- Example bookmark URL: `/games?team=BOS&date=2026-09-12`

## Why this shape
Hockey ops staff need to bookmark and share a *filtered* view (e.g. "just
the forwards," "tonight's home games") and have it reopen the same way
every time, even if the link is old or someone edits the query string by
hand. Falling back to safe defaults instead of throwing keeps every
players/games URL bookmarkable and crash-proof, matching the requirements
brief's first-paint and bookmarkability goals.
