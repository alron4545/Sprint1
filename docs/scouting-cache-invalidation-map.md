# Scouting cache invalidation map

Companion to `src/lib/scouting/mutation-hooks.ts`. If the code and this table
disagree, fix whichever is wrong in the same commit.

## Rules

- Invalidate **related** query keys only — never the whole cache, and never
  a hand-written key array: use the `scoutingKeys` factories from
  `query-keys.ts`.
- Invalidate only after a write **really succeeded**. The writes in
  `mutations.ts` return `{ data, error }`; the hooks convert `{ error }` into
  a thrown `Error` (readable message on `mutation.error.message`), so a failed
  save never triggers a refetch.
- Ask of every write: *which cached reads contain data this write changed?*
  A new event changes event lists and totals — it does **not** change any
  player or game row, so those caches are left alone.
- Invalidating marks a key stale: on-screen lists refetch now, off-screen ones
  refetch on next visit. The hook's mutation stays pending until the
  on-screen refetches finish.

## Mutation → keys

| Mutation hook | Calls (`mutations.ts`) | Invalidates (`scoutingKeys`) | Scout reason |
|---|---|---|---|
| `useCreateScoutingEvent` | `createScoutingEvent` | `events()` (all events lists, plain and with-details, any filters); `aggregates()` (per-player totals) | Logging a goal must show in the game feed and bump that player's totals |
| `useUpdatePlayerNotes` | `updatePlayerNotes` | `playerDetail(playerId)`; `playerLists()` | The player page and roster lists carry notes, so they must show the edit |

### Deliberately NOT invalidated

| After | Left cached | Why |
|---|---|---|
| `useCreateScoutingEvent` | `players()`, `games()` | No player or game row contains event data |
| `useUpdatePlayerNotes` | `events()`, `aggregates()` | Feed and totals carry only name/position/team, not notes |
| either | other players' `playerDetail(...)` | Unrelated rows |

If a future screen shows event counts inside a player or game detail, revisit
the first row — that cache would then be affected.

## Not covered (no write exists yet)

The lesson's example lists create/update hooks for players, games, and event
edits. `mutations.ts` only has `createScoutingEvent` and `updatePlayerNotes`,
so only those two hooks exist. A new write helper (e.g. `createPlayer`,
`updateScoutingEvent`) needs its typed helper first, then a hook and a row in
the table above: new/edited player → `players()`; game → `games()`; edited
event → `events()` + `aggregates()`.

## Out of scope for this step

- UI forms/buttons and the app's `QueryClientProvider` (UI step).
- SQL changes or regenerating database types.
