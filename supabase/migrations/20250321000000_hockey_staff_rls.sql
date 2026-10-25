-- supabase/migrations/20250321000000_hockey_staff_rls.sql
-- Sprint 4: row-level security for hockey staff data.
-- Source of truth: docs/security/rls-policy-spec.md (section names below refer to it).
-- Roles: coaching | scouting | medical. Anything not allowed here is denied.
--
-- Safe to re-run. Do NOT apply to the live project until the app reads through
-- signed-in server functions: the Sprint 3 pages use the anon key and will show
-- empty results once this is applied (spec, cross-cutting rule 7).
--
-- After applying, add the first staff profile by hand in the Supabase SQL editor
-- (a role is never assigned from the browser):
--   insert into public.staff_profiles (user_id, role) values ('<auth user uuid>', 'scouting');

-- =============================================================================
-- 1) Tables the policies need
-- =============================================================================

-- Spec "Identity linkage": one row per staff member, linked to the Auth user.
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint staff_profiles_role_check check (role in ('coaching', 'scouting', 'medical'))
);

-- Spec "Blocking decision": scouting note text leaves the shared roster table.
create table if not exists public.player_scouting_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now(),
  constraint player_scouting_notes_note_not_blank check (char_length(trim(note)) > 0)
);
create index if not exists player_scouting_notes_player_id_idx
  on public.player_scouting_notes (player_id);

-- Spec "Tables in scope": planned medical table. Generic placeholder columns;
-- stakeholders refine them later. Matrix Q3 (caseload) is still open.
create table if not exists public.sports_science_records (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete restrict,
  recorded_on date not null default current_date,
  body text not null,
  created_at timestamptz not null default now(),
  constraint sports_science_records_body_not_blank check (char_length(trim(body)) > 0)
);
create index if not exists sports_science_records_player_id_idx
  on public.sports_science_records (player_id);

-- Spec "Tables in scope": planned plans table. Generic placeholder columns.
create table if not exists public.practice_game_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  constraint practice_game_plans_title_not_blank check (char_length(trim(title)) > 0)
);

-- Move existing player notes into the new table, then drop the old column.
-- Runs once: after the column is gone this block does nothing.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'players' and column_name = 'notes'
  ) then
    insert into public.player_scouting_notes (player_id, note)
    select id, btrim(notes) from public.players
    where notes is not null and btrim(notes) <> '';
    alter table public.players drop column notes;
  end if;
end
$$;

-- =============================================================================
-- 2) Role helper (spec "Identity linkage": role comes from staff_profiles for
--    auth.uid(); never from anything the browser sends)
-- =============================================================================

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.staff_profiles where user_id = auth.uid() limit 1;
$$;

revoke all on function public.current_staff_role() from public;
revoke all on function public.current_staff_role() from anon;
grant execute on function public.current_staff_role() to authenticated;

-- =============================================================================
-- 3) Enable and force RLS on every sensitive table (spec "Policy intents")
-- =============================================================================

alter table public.staff_profiles        enable row level security;
alter table public.players               enable row level security;
alter table public.games                 enable row level security;
alter table public.scouting_events       enable row level security;
alter table public.player_scouting_notes enable row level security;
alter table public.sports_science_records enable row level security;
alter table public.practice_game_plans   enable row level security;

alter table public.staff_profiles        force row level security;
alter table public.players               force row level security;
alter table public.games                 force row level security;
alter table public.scouting_events       force row level security;
alter table public.player_scouting_notes force row level security;
alter table public.sports_science_records force row level security;
alter table public.practice_game_plans   force row level security;

-- =============================================================================
-- 4) Table privileges: second layer of default deny. Signed-out (anon) gets
--    nothing. Signed-in users get only the operations the spec allows on a
--    table. Nobody gets DELETE (spec: delete is denied everywhere).
--    service_role keeps its own access and is not touched here.
-- =============================================================================

revoke all on public.staff_profiles, public.players, public.games,
              public.scouting_events, public.player_scouting_notes,
              public.sports_science_records, public.practice_game_plans
  from anon, authenticated;

grant select         on public.staff_profiles         to authenticated;
grant select         on public.players                to authenticated;
grant select         on public.games                  to authenticated;
grant select, insert, update on public.scouting_events        to authenticated;
grant select, insert, update on public.player_scouting_notes  to authenticated;
grant select, insert, update on public.sports_science_records to authenticated;
grant select, insert, update on public.practice_game_plans    to authenticated;

-- The totals function keeps running with the caller's permissions (security
-- invoker), so these policies apply to it. Signed-out users lose execute.
revoke execute on function public.player_event_counts(uuid, date, date) from anon;

-- =============================================================================
-- 5) Policies
-- =============================================================================

-- staff_profiles: SELECT own row only; no INSERT/UPDATE/DELETE policy = denied.
drop policy if exists staff_profiles_select_own on public.staff_profiles;
create policy staff_profiles_select_own on public.staff_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- players (roster): SELECT for all three roles. Writes denied (no policy).
drop policy if exists players_select_staff on public.players;
create policy players_select_staff on public.players
  for select to authenticated
  using ((select public.current_staff_role()) in ('coaching', 'scouting', 'medical'));

-- games: SELECT for coaching and scouting; medical denied. Writes denied.
drop policy if exists games_select_coaching_scouting on public.games;
create policy games_select_coaching_scouting on public.games
  for select to authenticated
  using ((select public.current_staff_role()) in ('coaching', 'scouting'));

-- scouting_events: scouting only. No DELETE policy.
drop policy if exists scouting_events_select_scouting on public.scouting_events;
create policy scouting_events_select_scouting on public.scouting_events
  for select to authenticated
  using ((select public.current_staff_role()) = 'scouting');

drop policy if exists scouting_events_insert_scouting on public.scouting_events;
create policy scouting_events_insert_scouting on public.scouting_events
  for insert to authenticated
  with check ((select public.current_staff_role()) = 'scouting');

drop policy if exists scouting_events_update_scouting on public.scouting_events;
create policy scouting_events_update_scouting on public.scouting_events
  for update to authenticated
  using ((select public.current_staff_role()) = 'scouting')
  with check ((select public.current_staff_role()) = 'scouting');

-- player_scouting_notes: same rules as scouting_events.
drop policy if exists player_scouting_notes_select_scouting on public.player_scouting_notes;
create policy player_scouting_notes_select_scouting on public.player_scouting_notes
  for select to authenticated
  using ((select public.current_staff_role()) = 'scouting');

drop policy if exists player_scouting_notes_insert_scouting on public.player_scouting_notes;
create policy player_scouting_notes_insert_scouting on public.player_scouting_notes
  for insert to authenticated
  with check ((select public.current_staff_role()) = 'scouting');

drop policy if exists player_scouting_notes_update_scouting on public.player_scouting_notes;
create policy player_scouting_notes_update_scouting on public.player_scouting_notes
  for update to authenticated
  using ((select public.current_staff_role()) = 'scouting')
  with check ((select public.current_staff_role()) = 'scouting');

-- sports_science_records: STRICT, medical only. No DELETE policy.
drop policy if exists sports_science_records_select_medical on public.sports_science_records;
create policy sports_science_records_select_medical on public.sports_science_records
  for select to authenticated
  using ((select public.current_staff_role()) = 'medical');

drop policy if exists sports_science_records_insert_medical on public.sports_science_records;
create policy sports_science_records_insert_medical on public.sports_science_records
  for insert to authenticated
  with check ((select public.current_staff_role()) = 'medical');

drop policy if exists sports_science_records_update_medical on public.sports_science_records;
create policy sports_science_records_update_medical on public.sports_science_records
  for update to authenticated
  using ((select public.current_staff_role()) = 'medical')
  with check ((select public.current_staff_role()) = 'medical');

-- practice_game_plans: coaching only. No DELETE policy.
drop policy if exists practice_game_plans_select_coaching on public.practice_game_plans;
create policy practice_game_plans_select_coaching on public.practice_game_plans
  for select to authenticated
  using ((select public.current_staff_role()) = 'coaching');

drop policy if exists practice_game_plans_insert_coaching on public.practice_game_plans;
create policy practice_game_plans_insert_coaching on public.practice_game_plans
  for insert to authenticated
  with check ((select public.current_staff_role()) = 'coaching');

drop policy if exists practice_game_plans_update_coaching on public.practice_game_plans;
create policy practice_game_plans_update_coaching on public.practice_game_plans
  for update to authenticated
  using ((select public.current_staff_role()) = 'coaching')
  with check ((select public.current_staff_role()) = 'coaching');
