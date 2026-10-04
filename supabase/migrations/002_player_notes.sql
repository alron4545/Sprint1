-- supabase/migrations/002_player_notes.sql
-- Sprint 3, Topic 5: scouts need to keep free-text notes on a player, so the
-- typed updatePlayerNotes() helper has a real column to write to.
-- Nullable on purpose: existing players (and new ones) start with no notes.

alter table public.players
  add column if not exists notes text;
