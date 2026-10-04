# Scouting acceptance verification

**Scope:** the five success criteria in `docs/scouting-data-requirements.md`.
**Promise being tested:** a schema change should not silently break the board.
**Honest summary:** four of five criteria have automated evidence against a *stand-in* (in-memory Postgres, a real TanStack cache with stubbed writes, and a browser run with mocked Supabase responses). One step — a click-through against the **live** Supabase project — is **pending**. Auth and row-level security are **not verified** and are out of scope.

## How to read the status column

| Status | Meaning |
|---|---|
| Verified (stand-in) | Passed in an automated check that imitates the real service. Not proof against the live project. |
| Verified (static) | Checked by the TypeScript compiler or a source search. |
| Pending | Not yet run. Do not treat as done. |
| Not verified | Deliberately not tested this sprint. |

## Criteria

| # | Criterion | Evidence | Status |
|---|---|---|---|
| 1 | Join integrity: an event always points at a real player and a real game | Database constraint test on in-memory Postgres (PGlite) running `001_scouting_schema.sql`. Rejected: event for a missing player (23503), event for a missing game (23503), null player (23502), blank `event_type` (23514), delete of a player or game that still has events (23001, restrict). Accepted: a valid event. | Verified (stand-in) |
| 2 | Filter fidelity: player, game and event filters return only matching rows | Query helpers typed against generated `Database` types; `tsc --noEmit` passes. Browser run (mocked REST) checked position/team filters, game filter and the empty state. Query behavior against live data not yet seen. | Verified (static) + stand-in; live pending |
| 3 | Schema-change safety: a rename or wrong type fails before deploy | Type-boundary probes, all failed `tsc` as intended: wrong column name, wrong id type, misspelled RPC name, misspelled RPC argument, missing required insert field, unknown column on insert. A misspelled column inside a `select()` string is only caught when the result passes through an explicit return type (every helper has one). | Verified (static) |
| 4 | Aggregate correctness: totals come from the database RPC | `player_event_counts` run on PGlite: all games, one game, date range, a game with no events, case-insensitive goal count, players with no events absent (inner join). Boundary search: only `rpc.ts` calls `.rpc`. | Verified (stand-in) |
| 5 | Cache freshness: a saved event is visible without reload | TanStack cache test with stubbed writes: a successful event marks every events list and the totals stale and leaves players and games alone; a failed write rejects with a readable message and marks nothing stale; a notes update marks only player lists and that player's detail. Browser run: new event appeared with no reload, totals updated. | Verified (stand-in) |

## Automated checks run

- `tsc --noEmit`: passes after every step through the smoke routes.
- Source searches over `src/`: no `any`, no `@ts-ignore`, no `@ts-expect-error`. The only non-trivial cast is `as Partial<T>` in `query-keys.ts` (`compact()`).
- Boundary search: no route or component imports the raw Supabase client or calls `.from` / `.rpc` outside `src/lib/scouting`.
- Browser smoke run (Playwright + Chromium, Supabase REST mocked): 14 of 14 checks passed — filters, empty state, form options come from data, feed shows names, new event appears without reload, readable failure message with no refetch, totals update, game filter, load-error alert, no page errors.
- Typegen against the live project confirmed the schema exists as expected (tables, foreign keys, `players.notes`, the RPC function).

## Pending: live click-through

Not done yet. Owner: Mike. Steps:

1. Paste the public anon key into `.env.local` (never the service-role key).
2. Insert sample data (3 players, 2 games, 1 event) in the Supabase SQL editor.
3. Run `npm run dev` and open `/scouting/players`, `/scouting/events`, `/scouting/aggregates`.
4. Log a goal for Ben Booth; confirm it appears in the feed and the totals change.

Record the result here (pass / fail, date) before anyone calls criterion 2 or 5 fully accepted.

## Not verified

- **Auth and roles:** there are none.
- **Row-level security:** RLS is off on the tables and no policies exist. Anyone holding the public anon key can read and write. Known risk; see `docs/scouting-schema-notes.md`.
- **End-to-end browser coverage:** one smoke script against mocked responses. No committed Playwright suite.
- **Production deployment:** the Vercel production URL returned 404 earlier and was not diagnosed.
- **Mutations beyond two:** only "log event" and "update player notes" exist.
- **Migration tooling:** two files share the `002_` prefix. Fine in the SQL editor; rename before using `supabase db push`.
