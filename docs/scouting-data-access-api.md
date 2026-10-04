# Scouting data-access public API

## Purpose

UI routes and TanStack Query hooks may reach Supabase **only** through the
three modules below. That keeps joins, filters, writes, and the aggregate
RPC schema-safe for Northline Hockey scouts: types come from
`src/types/database.ts`, so a renamed column or function fails at typecheck,
not in a scout's browser.

## Allowed imports (public)

| Module | Import these | Scout use |
|--------|--------------|-----------|
| `src/lib/scouting/queries.ts` | `listPlayers({ position, teamName })` | Player list, filtered by position or team |
| | `getPlayerById(id)` | One player (`null` if not found) |
| | `listGames({ playedFrom, playedTo, opponent })` | Games for a season or date range |
| | `getGameById(id)` | One game (`null` if not found) |
| | `listScoutingEvents({ playerId, gameId, eventType })` | Plain event list |
| | `listScoutingEventsWithDetails({ playerId, gameId, eventType })` | Board feed: events with player and game names |
| `src/lib/scouting/mutations.ts` | `createScoutingEvent(input)` | Log an event for a player in a game |
| | `updatePlayerNotes(playerId, notes)` | Save a scout's notes on a player |
| `src/lib/scouting/rpc.ts` | `getPlayerEventCounts({ gameId, playedFrom, playedTo })` | Events and goals per player, computed in one database call |

Types that UI code may also import: `PlayerRow`, `GameRow`,
`ScoutingEventRow`, `ScoutingEventWithDetails`, the `*Filters` types,
`ScoutingEventInsert`, `PlayerUpdate`, `MutationResult`,
`PlayerEventCountRow`.

### How the three families behave

- **Reads** (`queries.ts`, `rpc.ts`) **throw** on a Supabase error. Callers
  (or TanStack Query) handle the failure; nothing returns empty data to hide it.
- **Writes** (`mutations.ts`) **return** `{ data, error }` with a readable
  `error.message` and never throw for expected problems such as a blank event type.

### Examples (scout-facing)

```ts
const forwards = await listPlayers({ position: 'C' })
const feed = await listScoutingEventsWithDetails({ gameId })
const totals = await getPlayerEventCounts({ playedFrom: '2026-10-01', playedTo: '2026-10-31' })
const saved = await createScoutingEvent({ player_id, game_id, event_type: 'goal' })
if (saved.error) showMessage(saved.error.message)
```

## Private (do not import from routes, components, or hooks)

- `src/lib/supabase/client.ts` — the raw client; only `src/lib/scouting/*` uses it.
- `supabase.from('...')` anywhere outside `src/lib/scouting/`.
- `supabase.rpc('...')` anywhere outside `src/lib/scouting/rpc.ts`.
- Hand-written SQL strings in the app.
- `app/lib/supabase.server.ts` is a different thing (server-only, service-role key)
  and is unrelated to this layer; never import it into scout screens.

At the time this was written, a search of `app/` and `src/` found no imports
of the raw client or `.rpc`/`.from` calls outside `src/lib/scouting/`.
Nothing *enforces* this yet — it is a rule, checked by review.

## Type contract

- Every helper is typed from `src/types/database.ts`; no `any`, no casts of
  RPC results.
- After **any** migration or function change: apply it, regenerate
  `src/types/database.ts` (recipe in `docs/typegen-notes.md`), and only then
  add UI callers.
- Typegen quirk: it marks every column of a function's `RETURNS TABLE` as
  non-null. `PlayerEventCountRow` widens `player_position` and `team_name`
  to `string | null` because the underlying player columns are nullable. Keep
  that widening if the type is ever re-derived.

## Stability rule

If a new scout screen needs data this API doesn't expose, **add a typed
helper in `src/lib/scouting/` and update this document** — do not bypass the
layer with a one-off Supabase call.
