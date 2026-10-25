// src/server/scouting-notes.ts
//
// Protected data path: the ONLY way the scouting page gets note text.
//
//   1. requireSession()  -> refuses anyone without a verified session, BEFORE any query
//   2. createSupabaseServerClient() -> the anon key plus THIS caller's session, so the
//      query reaches Postgres as the signed-in user and row-level security applies
//   3. which rows come back is decided by the database policies
//      (supabase/migrations/20250321000000_hockey_staff_rls.sql; docs/security/rls-policy-spec.md),
//      not by this code. There is deliberately no role check here: a role check in app code
//      would be a second, weaker copy of the rule.
//
// Takes no input, so nothing the browser sends can pick a role or a user.
// Never import this module's Supabase client into route components.

import { createServerFn } from '@tanstack/react-start'
import { requireSession } from '../lib/auth/require-session'
import { createSupabaseServerClient } from '../lib/supabase/server'

export type ScoutingNoteRow = {
  id: string
  player_id: string
  player_name: string
  note: string
  created_at: string
}

export const listScoutingNotes = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<ScoutingNoteRow>> => {
    await requireSession()

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('player_scouting_notes')
      .select('id, player_id, note, created_at, player:players(full_name)')
      .order('created_at', { ascending: false })

    if (error) {
      // Neutral message: no table names, SQL, or policy details reach the browser.
      throw new Error('Could not load scouting notes')
    }

    return data.map((row) => ({
      id: row.id,
      player_id: row.player_id,
      player_name: row.player?.full_name ?? 'Unknown player',
      note: row.note,
      created_at: row.created_at,
    }))
  },
)
