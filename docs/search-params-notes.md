# Search params design notes — players & games filters

## Players (`/players`)
- Schema: `validatePlayersSearch` in `src/lib/searchSchemas.ts`
- Keys:
  - `position` — one of `F` | `D` | `G`, optional. Any other/missing value
    falls back to `undefined` ("any position").
  - `status` — one of `active` | `ir` | `all`. Any other/missing value
    falls back to `undefined`, which the page treats as "all".
- Bad input handling: unknown keys are ignored; invalid values for a known
  key fall back to that key's default. The validator never throws, so a
  garbage query string never crashes the page — worst case it behaves like
  no filter was applied.
- Since Step 9 (loaders): the validated `position`/`status` values are
  passed into `listPlayers()` in `src/server/directoryLoader.ts`, so the
  filtered result is what the server renders on first paint — not a
  client-side re-filter of data that was already sent down.
- Example bookmark URL: `/players?position=F&status=active`

## Games (`/games`)
- Schema: `validateGamesSearch` in `src/lib/searchSchemas.ts`
- Keys:
  - `team` — free-text, trimmed and upper-cased; empty/missing falls back
    to `undefined` ("any opponent"). Note: as of Step 9 this filters by
    **opponent name** (case-insensitive substring) via `listGames()`, since
    the seed schedule (`src/data/hockeySeed.ts`) models opponents by name,
    not team abbreviation — there's no `BOS`/`NYR`-style code to match
    against yet. The `team` param name is kept as-is to avoid reshaping the
    URL contract again; it may get a clearer name once real team data
    exists.
  - `date` — a plain `YYYY-MM-DD` string; anything that doesn't match that
    shape falls back to `undefined` ("any date").
- Bad input handling: same pattern as players — unknown keys ignored,
  invalid values fall back to "no filter," never a crash.
- `player` — optional player id (any non-empty trimmed string; not
  validated against real ids since it's just cross-link context). Set by
  the "View games" link on a player detail page. **Important caveat:**
  the seed schedule has no games-per-player relation, so this key
  *labels* the games page ("showing context for player X") rather than
  actually filtering which games appear — see Step 10 notes.
- Example bookmark URL: `/games?team=North%20Bay&date=2026-03-14`
- Example cross-link URL: `/games?player=p-17` (shows a context banner for
  Alex Mercer, does not filter the list)

## Why this shape
Hockey ops staff need to bookmark and share a *filtered* view (e.g. "just
the forwards," "North Bay games") and have it reopen the same way every
time, even if the link is old or someone edits the query string by hand.
Falling back to safe defaults instead of throwing keeps every players/games
URL bookmarkable and crash-proof, matching the requirements brief's
first-paint and bookmarkability goals.
