# Type generation notes — scouting schema

Companion to `src/types/database.ts`. Read this before regenerating that
file so the recipe doesn't have to be reconstructed from memory each time.

## Migration applied

- File: `supabase/migrations/001_scouting_schema.sql`
- Applied via: Supabase Dashboard SQL Editor (pasted the migration's SQL
  and ran it directly against the project)
- Project reference: `pfxughbxnlmclpwtttzu` (this is just an identifier,
  not a secret — safe to have in this file)

## Typegen command

- Logged in first with:
  ```
  npx supabase login
  ```
  (opens a browser window to approve; no password or token ever lands in
  this repo or in chat)
- Then generated types with:
  ```
  npx supabase gen types typescript --project-id pfxughbxnlmclpwtttzu --schema public > src/types/database.ts
  ```
- Output path: `src/types/database.ts`

## What was verified after generating

- `public.Tables` includes `players`, `games`, and `scouting_events`,
  matching the three tables in the migration.
- Column names match the SQL exactly, including snake_case
  (`full_name`, `jersey_number`, `team_name`, `played_on`, `is_home`,
  `event_type`, `clock_seconds`, `player_id`, `game_id`, etc.) — nothing
  renamed or reshaped by typegen.
- `scouting_events.Relationships` includes both foreign keys from the
  migration: `scouting_events_game_id_fkey` (`game_id` → `games.id`) and
  `scouting_events_player_id_fkey` (`player_id` → `players.id`).
- `players` and `games` both show `Relationships: []`, which is correct —
  neither table has an outgoing foreign key of its own.

## When to regenerate

Regenerate any time `supabase/migrations/` changes — including the
set-based aggregate RPC planned for a later step, since Postgres
functions also show up in these generated types. Re-run the same
`supabase gen types typescript` command above and diff the result against
the migration before committing; never hand-edit `database.ts` to patch
over a mismatch — fix the SQL, re-apply it, regenerate.

## Secrets note

Nothing in this file is sensitive. The project reference above is just an
identifier. The actual secrets for this project — the database password
and the service-role key — are never written to this file, this repo, or
any chat with an assistant; they stay in the Supabase dashboard and, when
the app needs them at runtime, in local `.env` files that are gitignored.
