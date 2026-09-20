# Sprint 1 verification notes

Verified against a running dev server (`npm run dev`) with `curl`, checking
the raw HTML response rather than the rendered page, so these checks catch
a route that only fills in after client-side JS runs.

| # | Acceptance criterion (from `docs/requirements-brief.md`) | Command | Result |
| - | --- | --- | --- |
| 1 | `/` shows the home shell with directory-oriented content | `curl localhost:3000/` | HTML includes "Hockey Ops Player Directory", "View Players", "View Games" |
| 2 | `/players` HTML already lists player names | `curl localhost:3000/players` | HTML includes seed player names (e.g. "Jordan Reyes", "Sam Okafor") before any JS runs |
| 3 | `/players/<id>` opens that player, URL is bookmarkable | `curl localhost:3000/players/2` | HTML includes "Sam Okafor" for id `2`; same URL re-requested returns the same player every time (it's a pure lookup by id, no session state) |
| 4 | `/games` HTML already lists games | `curl localhost:3000/games` | HTML includes seed game opponents (e.g. "Riverside Otters", "Bay City Sharks") |
| 5 | Primary nav reaches Home, Players, Games from any page | `curl localhost:3000/games \| grep href` | `href="/players"`, `href="/games"`, and the Home link are present in the nav on a non-home page |
| 6 | Invalid player id shows a clear not-found state, not a crash | `curl -o /dev/null -w '%{http_code}' localhost:3000/players/999` | Returns HTTP `404` with a rendered "No player matches "999"" page, not a stack trace |

## What's still seed data, on purpose

Per the requirements brief, real database data, auth, and live feeds are out
of scope for Sprint 1. `src/data/hockeySeed.ts` holds the seed players and
games; `src/server/directoryLoader.ts` (`listPlayers`, `getPlayerById`,
`listGames`) is the only module that reads from it. Route loaders call
`directoryLoader`, never the seed file directly — that's the seam a later
sprint uses to swap in real Supabase-backed queries without touching any
route or component code.

## Not yet done (tracked, not silently skipped)

- No git repository has been initialized for this project yet — nothing
  from this sprint has been committed.
- `playerId` validation is currently "does a player with this id exist in
  the seed data" — the brief notes the exact validation rule (e.g. must be
  numeric) is still to be decided in a later step.
