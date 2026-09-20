# Server function contract — directory data

This is the contract for `src/server/directoryLoader.ts`'s exported
functions: what a caller may send in, exactly what comes back on success,
and exactly what comes back on failure. It's written now, against the
Sprint 1 seed data, specifically so that swapping the function bodies to
real Supabase-backed queries (see `/tmp/boundary-risk-notes.md`) never
requires a caller (a route loader) to change. If an implementation and this
document disagree, the implementation is wrong — fix the code, or bring a
question here and update the contract deliberately, don't let the code
drift.

None of these are wrapped in `createServerFn` yet — they're currently
plain functions reading `src/data/hockeySeed.ts`. This contract already
describes the shape they must have once they are server functions backed
by Supabase, so today's implementation and tomorrow's can be checked
against the same document.

## General rules (apply to every function below)

- **Inputs are a small, explicitly validated set of named fields — never a
  passed-through options/filter bag.** A caller cannot send anything that
  reaches a query builder unvalidated. Anything not listed under a
  function's "Input" below is not part of the contract, even if a future
  implementation would technically accept it.
- **Success responses return exactly the fields listed below — never a
  raw database row.** Adding a column to a future Supabase table must
  never change what a caller receives. The mapping from row to response is
  a named, unit-testable step, not `return data`.
- **Failure responses never contain a raw error object, a driver/database
  message, a stack trace, an env var, or a secret.** Every failure is one
  of the closed `reason` values listed below — nothing else is a valid
  value for that field, and no other field is added to carry extra detail.
- **"Not found" is a normal result, not a failure.** A missing player by
  id is an expected outcome the UI has a designed state for (see
  `docs/requirements-brief.md`, acceptance criterion 6) — it is not the
  same category as "the database is unreachable," and the two must stay
  visibly different in this contract so a future implementation can't
  quietly collapse them into one ambiguous shape.

## `listPlayers()`

- **Input:** none.
- **Success:** `PlayerView[]`, where

  ```ts
  interface PlayerView {
    id: string
    name: string
    number: number
    position: 'C' | 'LW' | 'RW' | 'D' | 'G'
    team: string
    status: 'active' | 'injured' | 'reserve'
  }
  ```

  (Matches `SeedPlayer` in `src/data/hockeySeed.ts` today. Any future
  Supabase row may have more columns than this — only these six fields
  ever leave the server function.)
- **Failure:** `{ ok: false, reason: 'unavailable' }` — the only failure
  case for this function is "the data source could not be reached/queried
  right now." An empty roster is `[]`, not a failure.

## `getPlayerById(playerId: string)`

- **Input:** `playerId` — a non-empty string. Rejected (see Failure below)
  if empty, not a string, or missing. *(The brief leaves the exact id
  format — e.g. numeric-only — undecided; tighten this rule here first if
  a later step settles it, then update the implementation to match, not
  the other way around.)*
- **Success:** a single `PlayerView` (same shape as above) for a matching
  id, **or** `undefined` when no player matches that id. Both are success
  outcomes — the caller (the route loader) is what turns `undefined` into
  the not-found UI state, via `notFound()`, same as it does today.
- **Failure:** `{ ok: false, reason: 'invalid_input' }` for a malformed
  `playerId`, or `{ ok: false, reason: 'unavailable' }` if the data source
  could not be reached/queried. Neither failure reason, nor anything else
  returned in that shape, may include the value the caller sent, a
  database message, or any part of a raw Supabase error.

## `listGames()`

- **Input:** none.
- **Success:** `GameView[]`, where

  ```ts
  interface GameView {
    id: string
    opponent: string
    date: string // ISO date, e.g. "2026-10-04"
    location: 'home' | 'away'
    result?: string
  }
  ```

  (Matches `SeedGame` in `src/data/hockeySeed.ts` today.)
- **Failure:** `{ ok: false, reason: 'unavailable' }`, same rule as
  `listPlayers()`.

## What this means for the current Sprint 1 code

`src/server/directoryLoader.ts`'s three functions already match the
*success* shapes above, because `SeedPlayer`/`SeedGame` were written to be
exactly the UI-facing fields. They do **not** yet return the failure shape
above — reading an in-memory array can't fail, so there's been nothing to
map. Implementing this contract for real is a follow-up step: wrap each
function in `createServerFn`, read through a server-only Supabase client
(`src/lib/supabase.server.ts`, not yet created), and add a `try/catch` that
turns any thrown error into `{ ok: false, reason: 'unavailable' }` —
without that file ever containing a raw Supabase error, `process.env`, or
the service-role key.

## Explicitly out of scope for this contract

- Search/filter params on `listPlayers()` (position, team) — the brief
  marks these optional-later; adding them means adding named, validated
  fields here first, not accepting a filter object.
- Auth/authorization on any of these calls.
- Anything about `POST`/write operations — all three functions are reads.
