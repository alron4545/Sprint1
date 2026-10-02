# Scouting data requirements — Northline Hockey

## 1. Actors and goals

| Actor | Goal | What they need from data |
|-------|------|---------------------------|
| Scout | Review players and games, and log/read events (goals, hits, scouting notes) tied to a specific player in a specific game | Lists of players and games; events that reliably resolve back to one real player and one real game, even after the schema changes; per-player totals without doing the math by hand |
| Ops / data steward | Keep player, game, and event data consistent as the schema evolves (columns renamed, added, restructured) | Typed access to the data so a schema change is caught as a build/typecheck error, not discovered later as a broken page in production |

Out of scope for this sprint: fan-facing apps, payments, video, and fantasy features. If a future prompt or draft invents any of these, that's scope creep — reject it and re-prompt.

## 2. Core entities and relationships (plain language)

- **Player** — a skater or goalie Northline scouts track. Has a unique identity and the basic fields a scout filters on (name, position, team/org label).
- **Game** — a contest on a specific date. Scouts attach events to a specific game, not to a date or team in the abstract.
- **Event** — something a scout observed about one player in one game (a goal, a hit, a written note). Every event belongs to exactly one player and exactly one game — never a free-floating record, never matched by name text.

Relationships that have to hold for the app to work:

- One player has many events, across many games.
- One game has many events, across many players.
- "Events for player X in game Y" is answered by following the player and game links on the event row — never by searching event text for a name or date.

This is also exactly where "the app breaks in production" happens in the client story: if those links are hand-written as untyped query strings instead of real typed joins, a renamed column compiles fine and only fails once a scout actually loads a page.

## 3. Filters and scout views

Scouts need to:

1. List players, optionally filtered by position or team/org label.
2. List games, optionally filtered by date range.
3. List events filtered by player, by game, or both together.
4. See a **set-based aggregate per player** — e.g. goals or event counts across all of that player's games — computed on the server (a Postgres RPC), not by the client fetching every event row and summing them in the browser.

Writes scouts and ops need:

- Create and update players and events through the app's typed data-access layer — never a raw SQL string assembled in the UI.

## 4. Success criteria (measurable)

1. **Join integrity** — every event returned to a scout view resolves to a real, identifiable player and a real, identifiable game; no orphaned events in seed/test data.
2. **Filter fidelity** — player, game, and combined player+game event filters return exactly the matching rows; an unset filter means "all" for that dimension, not "none."
3. **Schema-change safety** — all reads and writes go through TypeScript types generated from the actual Supabase schema, so renaming or mistyping a column is a build/typecheck failure, not a runtime surprise a scout finds first. This is the specific property the client story calls out, and the central thing this sprint has to prove.
4. **Aggregate correctness** — the per-player aggregate (goals/events across games) is computed by a single Postgres RPC call and matches a hand-counted total on the seed data; the client never sums raw event rows itself.
5. **Cache freshness** — after a scout creates or updates an event, the TanStack Query list and aggregate views that include it are invalidated so the UI doesn't keep showing stale counts or missing rows.

## 5. Glossary

| Term | Meaning in this project |
|------|--------------------------|
| Entity | A real-world thing stored as a table (player, game, event) |
| Join | Combining rows from related tables using their foreign-key links, not text matching |
| Filter | Narrowing a list by field values a scout chooses |
| Set-based aggregate | A count/sum/etc. computed across many rows at once on the server, not assembled row-by-row on the client |
| RPC (Postgres function) | A named function stored in the database that the client calls directly, instead of sending ad-hoc SQL |
| Generated types | TypeScript types produced from the live Supabase schema, so the compiler knows the real column names and types |
| Cache invalidation | Telling TanStack Query that previously-fetched data is stale after a mutation, so it refetches instead of showing old rows |

## 6. Source of truth

This file is the requirements source of truth for Sprint 3. Schema design, generated types, query modules, the RPC, and TanStack Query cache behavior in later steps all have to trace back to sections 1–4 above. If a later step needs to expand scope beyond what's written here, this document gets updated first.
