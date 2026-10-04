# Scouting schema notes

Companion to `supabase/migrations/001_scouting_schema.sql`. If this file and
the migration ever disagree, the migration is what Supabase actually ran —
fix the drift here, don't let this doc quietly go stale.

## Tables

- **players** — one row per skater/goalie Northline scouts track.
  `full_name` is required (non-blank, enforced by a check constraint);
  `position`, `jersey_number`, and `team_name` are nullable because a
  scout may add a player to the board before every roster detail is known.
- **games** — one row per contest. `opponent` and `played_on` are required;
  `venue` and `is_home` are extras beyond what the requirements brief named
  explicitly, added because a game row with only a date isn't useful on its
  own — flagging this as a judgment call, not a brief requirement.
- **scouting_events** — one row per thing a scout observed about one player
  in one game (a goal, a hit, a written note). `event_type` and the two
  foreign keys are required; `period`, `clock_seconds`, and `notes` are
  optional detail a scout may or may not record in the moment.

## Relationships

- `scouting_events.player_id -> players.id`, required, `on delete restrict`.
- `scouting_events.game_id -> games.id`, required, `on delete restrict`.

`on delete restrict` instead of `cascade`: deleting a player or game that
still has logged events almost certainly means someone meant to archive or
reassign the events first, not silently lose scouting history. Postgres
will reject that delete until the events are moved or removed on purpose.
Both foreign keys are `not null` — this is what makes requirements-brief
success criterion 1 ("join integrity... no orphaned events") a database
guarantee instead of just an application-level hope.

## Filters supported

- Players: by position, by team_name (plain `where` clauses; no index yet
  since there's no evidence of roster-table scale that needs one).
- Games: by date range, via `games_played_on_idx`.
- Events: by player, by game, or both, via the two single-column indexes
  plus the `(player_id, event_type)` composite for the aggregate step.

## Decisions / open questions

- **No closed set of `event_type` values yet.** The brief names goals,
  hits, and notes as examples but doesn't give a finished list, and the
  lesson says not to invent scope the brief doesn't ask for. I used a
  free-text column with a non-blank check instead of a Postgres enum, so
  the app can validate real values at the TypeScript layer in the next
  step without a migration every time a new event type is added. Open
  question for whoever reviews this: is a fixed enum ("goal", "assist",
  "hit", "penalty", "note") worth locking in now, or does the roster need
  more real usage first?
- **No RLS policies.** The requirements brief doesn't mention
  authorization or multi-user access control, and the original Sprint 1
  contract explicitly scoped auth out — carrying that same scoping
  forward rather than inventing a permissions model nobody asked for.
- **No seed data.** Left out per this step's instructions; seeding is a
  separate concern from the schema itself.
- **`jersey_number`, `team_name`, `venue`, `is_home`** are the four columns
  added beyond what the requirements brief explicitly named. None of them
  contradict the brief's scope (no fans/payments/video/fantasy creeping
  in) — they're ordinary roster/schedule fields a real scouting board
  would need, not new features.

## Change log

- **002_player_notes.sql** (Sprint 3, Topic 5) — added nullable `players.notes text`
  so scouts can keep free-text notes on a player and the typed
  `updatePlayerNotes()` helper has a real column to write to. Types were
  regenerated afterward (`src/types/database.ts` gained `notes` on
  players Row/Insert/Update and nothing else).

## Known risk: no row-level security yet

Tables created through the SQL editor do not have row-level security
enabled by default, and no policies exist. The browser client uses the
public anon key, so anyone holding that key could read **and write**
these tables directly. Acceptable for this class project (no real data,
no auth in the brief), but it is the first thing to fix — enable RLS and
add policies — before this schema ever holds real scouting data.
