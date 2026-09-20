# Server Function Contract — Hockey Operations Directory

## Purpose
Load directory rows (players and staff) for the Hockey Operations Directory
UI from the real `directory_people` Supabase table. Runs only on the
server, through `app/lib/supabase.server.ts`. Never exposes the
service-role key or any other secret to the browser.

## Function identity
- **Export name:** `listDirectoryEntries`
- **Module:** `app/server/directoryLoader.ts` — evolves the existing
  `listPlayers()` in place rather than adding a parallel file, per the
  plan already recorded in `docs/boundary-risk-notes.md`. `listGames()` in
  the same file is untouched: `directory_people` covers players and staff
  only, not games.
- **Kind:** TanStack Start server function (server-only entry point the
  `/players` route loader calls).

## Inputs (from the UI / caller)
All inputs are optional so the first caller can request "everything" and
later add filters.

| Input | Type (plain language) | Rules |
| --- | --- | --- |
| `search` | string | Trim whitespace. Empty or missing means "no text filter." Match against `full_name` (case-insensitive). |
| `role` | string | One of `"player"`, `"staff"`, or omit/empty for both — matches the table's own `role` check constraint exactly. Reject any other value with a validation error. |
| `limit` | number | Optional max rows. Default `100`. Clamp between 1 and 200. |

**Non-inputs (must NOT be accepted from the browser):** database
passwords, service-role keys, raw SQL, or "run any query" strings.

## Success output
Return a plain object the UI can render without further secret access.
Field names below map directly to `directory_people` columns — see the
schema in the previous step:

```ts
type DirectoryEntry = {
  id: string;              // directory_people.id
  displayName: string;     // directory_people.full_name
  role: "player" | "staff"; // directory_people.role
  teamName: string | null; // directory_people.team
  positionOrTitle: string | null; // directory_people.position
  jerseyNumber: number | null;    // directory_people.jersey_no — null for staff
};

type ListDirectoryEntriesResult = {
  ok: true;
  entries: DirectoryEntry[];
  // Useful later for empty states and debugging without leaking internals
  meta: { count: number; appliedFilters: { search: string | null; role: string | null } };
};
```

There is deliberately no `isActive` field — `directory_people` has no such
column. Do not invent a field the table doesn't have.

### Mapping notes (UI-facing, not a raw DB dump)
- Map DB columns into the fields above inside a pure helper (this is what
  later steps unit-test with Vitest).
- Do not return service keys, auth tokens, or internal Supabase error
  objects to the client.
- `id` is the table's own UUID — stable enough for a React key as-is.

## Error shapes
Always return a structured failure the UI can branch on — never throw raw
secrets or stack traces to the browser.

```ts
type ListDirectoryEntriesError = {
  ok: false;
  error: {
    code: "VALIDATION" | "UPSTREAM" | "UNKNOWN";
    message: string; // safe, human-readable, no secrets
  };
};
```

| Situation | code | message guidance |
| --- | --- | --- |
| Bad `role` or `limit` | `VALIDATION` | Say which input was invalid; do not echo secrets. |
| Supabase/network failure | `UPSTREAM` | "Directory temporarily unavailable." Log details server-side only. |
| Unexpected bug | `UNKNOWN` | Generic failure message; log details server-side only. |

`UNAUTHORIZED` is intentionally left out of this version — there is no
auth yet (that's a later sprint), so a code for it here would be
speculative. Add it when auth actually exists, without changing the
success shape.

**Result type:** `ListDirectoryEntriesResult | ListDirectoryEntriesError`
(discriminated by `ok`).

## Pure logic vs I/O (critical for later Vitest)

### Pure (no network, no env reads) — extract into mappers
- Normalize and validate inputs (`search`, `role`, `limit`).
- Map one raw `directory_people` row → `DirectoryEntry`.
- Case-insensitive name filtering in memory, if not pushed to the SQL
  query itself.

### I/O / server-only
- Call `getSupabaseServerClient()` from `app/lib/supabase.server.ts`.
- Query `directory_people`, applying `role`/`search`/`limit`.
- Log detailed errors on the server only.

## Boundary rules (from prior docs)
- The service-role key: server only — never in this contract's return
  type, never in a client bundle. See `docs/boundary-risk-notes.md`.
- This function always uses the **server** Supabase client
  (`app/lib/supabase.server.ts`), never a client-side one — there isn't a
  client-side Supabase client in this project at all, by design (see
  `docs/client-vs-server-inventory.md`).
- The browser receives only `DirectoryEntry` data or a safe error
  message — never a raw Supabase row or error object.

## Non-goals (out of scope for this function)
- Creating, updating, or deleting directory rows.
- File uploads or images.
- Full-text search ranking beyond a simple case-insensitive name match.
- Pagination cursors — `limit` alone is enough for v1.
- Auth / `UNAUTHORIZED` handling — added later without changing the
  success shape.
- A single-entry lookup for `/players/$playerId` (still backed by seed
  data via `getPlayerById()`) — that needs its own contract in a later
  step; this one only covers the list.

## Acceptance checks for implementers (next step)
1. `listDirectoryEntries` runs only through the server-function path —
   never called with the service key from a browser-imported module.
2. Inputs match the table above; an unrecognized `role` value returns
   `VALIDATION`, not a thrown exception.
3. Success payload matches the `DirectoryEntry` fields exactly — no
   `isActive`, `jerseyNumber` present and nullable.
4. Failures use `ok: false` and never include the service key or raw env
   values.
5. The row → `DirectoryEntry` mapper and the input-validation logic are
   both extractable into their own pure functions, so a later step can
   unit-test them without touching Supabase.

## Traceability
- Risks addressed: `docs/boundary-risk-notes.md` (secrets off the
  browser; trusted reads on the server).
- Placement: `docs/client-vs-server-inventory.md` (directory load =
  server; render = client).
- Real schema this contract targets: `directory_people` table created in
  the previous step (id, full_name, role, team, position, jersey_no,
  created_at).
