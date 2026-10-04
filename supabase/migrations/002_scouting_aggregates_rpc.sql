-- supabase/migrations/002_scouting_aggregates_rpc.sql
-- Scout question: how many events (and how many goals) did each player log,
-- optionally limited to one game and/or a date range of games?
-- Set-based: one JOIN + GROUP BY inside Postgres, so the board makes a single
-- call instead of fetching every event and counting in the browser.
-- Only players with at least one matching event appear (inner joins).
-- All three parameters are optional; null means "don't filter on this".

create or replace function public.player_event_counts(
  p_game_id uuid default null,
  p_played_from date default null,
  p_played_to date default null
)
returns table (
  player_id uuid,
  player_name text,
  player_position text,
  team_name text,
  event_count bigint,
  goal_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p.id as player_id,
    p.full_name as player_name,
    p.position as player_position,
    p.team_name as team_name,
    count(e.id)::bigint as event_count,
    count(e.id) filter (where lower(btrim(e.event_type)) = 'goal')::bigint as goal_count
  from public.scouting_events e
  join public.players p on p.id = e.player_id
  join public.games g on g.id = e.game_id
  where (p_game_id is null or e.game_id = p_game_id)
    and (p_played_from is null or g.played_on >= p_played_from)
    and (p_played_to is null or g.played_on <= p_played_to)
  group by p.id, p.full_name, p.position, p.team_name
  order by event_count desc, player_name asc;
$$;

revoke all on function public.player_event_counts(uuid, date, date) from public;
grant execute on function public.player_event_counts(uuid, date, date) to anon, authenticated, service_role;
