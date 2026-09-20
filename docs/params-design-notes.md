# Path params design notes — player detail

## Decision
- Route file: `src/routes/players/$playerId.tsx`
- URL pattern: `/players/$playerId`
- Param name: `playerId` (matches `docs/route-map.md` and the shared helper)

## Validation (Sprint 1)
- `parsePlayerIdParam` (in `src/lib/playerParams.ts`) requires a non-empty,
  trimmed string.
- Invalid or empty ids throw during route param parsing rather than
  silently rendering a fake "success" player sheet.
- Stricter validation (real roster UUIDs, numeric jersey ids) can come
  later once real data is wired up — a non-empty string is enough for
  this sprint's bookmarkable-shell requirement.

## Linking
- `src/routes/players/index.tsx` links each player with
  `<Link to="/players/$playerId" params={{ playerId }}>` — a real path
  param, not a `?playerId=` query string.
- `playerDetailPath()` in `src/lib/playerParams.ts` is available for any
  code that needs to build the path outside of `<Link>` (e.g. future
  redirects or tests).

## Why
Hockey ops staff need to open, share, and bookmark one player's page on
arena wifi and have it reopen the same player every time. A path param
(`/players/17`) is a complete, lasting reference to one player; a
query-string-only or in-memory-state approach would not survive a
bookmark or a shared link the way this sprint's requirements brief asks
for.
