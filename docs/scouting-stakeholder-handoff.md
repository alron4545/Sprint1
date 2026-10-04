# Northline scouting board — stakeholder handoff

**Audience:** scouts, operations, and the next developer.
**Status:** Sprint 3 data layer built and checked against stand-ins. **Not** signed off for production.
**One promise running through this document:** *a schema change should not silently break the board.*

Built from: `docs/scouting-data-requirements.md`, `docs/scouting-schema-notes.md`, `docs/scouting-data-access-api.md`, `docs/scouting-cache-invalidation-map.md`, `docs/scouting-acceptance-verification.md`.

## 1. For scouts and ops

- **What it does today:** three working pages — `/scouting/players` (roster, filter by position or team), `/scouting/events` (log a goal, assist, hit or note for a player in a game, and see the feed), and `/scouting/aggregates` (events and goals per player, optionally for one game or a date range).
- **What you should see:** log an event and it appears in the feed and in the totals without reloading the page. If the save fails you get a readable message, and nothing on screen changes.
- **What you should not assume:** there are no logins. Anyone with the app's public key can read and change data. Do not put sensitive notes in it yet.
- **Not yet confirmed on real data:** the pages have been tested with simulated responses. The first run against the live database is still pending (section 5).
- **Why it matters to you:** when the database design changes, the developers' tooling is set up to fail loudly before release rather than show you a blank or wrong board.

## 2. In-scope entities and typed boundary

Three tables, defined in `supabase/migrations/001_scouting_schema.sql`:

| Entity | Holds | Safety rules in the database |
|---|---|---|
| Player | full name, position, jersey number, team, scout notes (`notes`, added in `002_player_notes.sql`) | Full name cannot be blank |
| Game | opponent, date played, venue | Opponent cannot be blank; date is required |
| Event (`scouting_events`) | which player, which game, event type, game-clock seconds, notes | Must point at a real player and game; event type cannot be blank; a player or game with events cannot be deleted |

**Typed boundary.** Database types are generated from the live project into `src/types/database.ts` (recipe: `docs/typegen-notes.md`). All data access goes through `src/lib/scouting/` (`queries.ts` reads, `mutations.ts` writes, `rpc.ts` the totals function). Pages and hooks import only those helpers; the raw Supabase client is private. A search found no violations, and the code has no `any` or type-suppression comments.

*Tie to the promise:* if a column is renamed or a type changes **and the types are regenerated**, that regeneration makes the compiler flag every helper that used the old shape, so the break shows up at build time. Probes confirmed this for wrong columns, wrong ids, a misspelled RPC name and argument, and missing required fields. If regeneration is skipped, the compiler cannot see the rename and the break only shows when the page is used; nothing enforces regeneration yet (see the acceptance doc's regression note).

## 3. RPC purpose

`player_event_counts` (migration `002_scouting_aggregates_rpc.sql`) returns, per player, the number of events and the number of goals, optionally for one game or a date range. It runs as one database call instead of the page adding up rows, so totals match across screens. Players with no events do not appear. Wrapped by `getPlayerEventCounts` in `rpc.ts`, the only place allowed to call `.rpc`.

Known quirk: generated types mark all returned columns as non-null; the wrapper widens position and team to allow null to match reality.

*Tie to the promise:* the function name and its arguments are type-checked, so a rename in the database that is not carried into the app fails typecheck rather than returning nothing.

## 4. Cache invalidation rules

The board keeps recent results in memory so it feels fast. After a write, only the stale parts are refreshed (full map: `docs/scouting-cache-invalidation-map.md`):

| Action | Refreshed | Left alone |
|---|---|---|
| Log an event | all event lists, per-player totals | players, games |
| Edit player notes | that player, roster lists | event feed, totals |
| Failed save | nothing | everything |

Rules: refresh only after a write really succeeded; always use the shared key factory, never hand-written keys; never wipe the whole cache.

*Tie to the promise:* when a new kind of write or a new screen shows different data, the map must be updated in the same commit, or the board can display stale numbers without any error.

## 5. Acceptance snapshot (honest)

Details: `docs/scouting-acceptance-verification.md`.

| Criterion | Status |
|---|---|
| Join integrity | Verified on in-memory Postgres |
| Filter fidelity | Verified by typecheck and mocked browser run; live data pending |
| Schema-change safety | Verified by compiler probes |
| Aggregate correctness | Verified on in-memory Postgres |
| Cache freshness | Verified with a real cache and stubbed writes, and a mocked browser run |
| **Live Supabase click-through** | **Pending** (owner: Mike) |

This is **not** a full end-to-end test and **not** a production security sign-off.

## 6. Explicitly out of scope

- **Authentication and roles:** none exist; no scout, coach or admin distinction.
- **Playwright coverage depth:** only a one-off smoke script against mocked responses; no committed suite, no multi-browser or CI runs.
- **Production row-level security polish:** RLS is off and no policies exist. Anyone with the public key can read and write. Recorded as a known risk.
- **Missing write helpers:** only "log event" and "update player notes" exist. Creating or editing players and games, and editing or deleting events, are not built and have no cache rules yet.
- **Production deployment:** the Vercel production URL returned 404 earlier and has not been diagnosed.
- **Navigation:** the main menu does not link to the scouting pages; they are reached by typing the address.
- Also out of scope from the requirements: fans, payments, video, fantasy.

Nothing in this list should be reported as done.

## 7. Schema-evolution checklist

Use for any change to tables, columns or functions, so the board does not break silently:

1. Write a new numbered migration in `supabase/migrations/` (do not edit old ones). Avoid reusing a number — `002_` is already used twice, which must be fixed before using `supabase db push`.
2. Run it in Supabase.
3. Regenerate types (`docs/typegen-notes.md`) and commit `src/types/database.ts`.
4. Run `tsc --noEmit`. Fix every error in `queries.ts`, `mutations.ts`, `rpc.ts` and the pages. Do not silence with casts.
5. If an RPC changed, update `rpc.ts` and recheck null handling on returned columns.
6. If a write was added or changed, update `mutation-hooks.ts` and the cache map table.
7. Update `docs/scouting-schema-notes.md` change log and `docs/scouting-data-access-api.md`.
8. Rerun the acceptance checks and update `docs/scouting-acceptance-verification.md`.
9. Never put the service-role key or database password in docs, commits or chat.

## 8. Artifact index

| Artifact | Location |
|---|---|
| Requirements and success criteria | `docs/scouting-data-requirements.md` |
| Schema and RLS risk, change log | `docs/scouting-schema-notes.md` |
| Migrations | `supabase/migrations/001_scouting_schema.sql`, `002_player_notes.sql`, `002_scouting_aggregates_rpc.sql` |
| Generated types and recipe | `src/types/database.ts`, `docs/typegen-notes.md` |
| Client | `src/lib/supabase/client.ts` |
| Reads, writes, totals | `src/lib/scouting/queries.ts`, `mutations.ts`, `rpc.ts` |
| Keys, read hooks, write hooks | `src/lib/scouting/query-keys.ts`, `hooks.ts`, `mutation-hooks.ts` |
| Public API (see note) | `docs/scouting-data-access-api.md` |
| Cache map | `docs/scouting-cache-invalidation-map.md` |
| Pages | `src/routes/scouting/{players,events,aggregates}.tsx`, wired through `app/routes/scouting/` |
| Acceptance evidence | `docs/scouting-acceptance-verification.md` |

Note: the public API doc covers the helpers but does not yet describe the hooks modules or the pages.

## 9. Next-sprint boundaries

In scope next: complete the live click-through and record it; add real navigation links; build the missing write helpers and hooks (each with a cache-map row); rename the duplicate `002_` migration; diagnose the Vercel 404.
Decide before building: whether auth and RLS come first, since they change who may call every helper.
Not next, unless re-planned: a full Playwright suite, roles, and any feature in the out-of-scope list.

## 10. Sign-off

| Role | Name | Date | Notes |
|---|---|---|---|
| Developer | | | Data layer built; live check pending |
| Scout representative | | | |
| Operations | | | |
