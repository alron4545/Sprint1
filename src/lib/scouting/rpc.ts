// src/lib/scouting/rpc.ts
//
// Calls the set-based Postgres function player_event_counts()
// (supabase/migrations/002_scouting_aggregates_rpc.sql): ONE round trip that
// returns per-player event and goal totals, instead of fetching every event
// and counting in the browser.
//
// The function name, argument names, and row columns all come from the
// generated Database type (src/types/database.ts). Rename anything in the SQL,
// regenerate the types, and this file fails at typecheck instead of in a
// scout's browser. This is the ONLY module allowed to call supabase.rpc().

import type { Database } from '../../types/database'
import { supabase } from '../supabase/client'

type RpcDef = Database['public']['Functions']['player_event_counts']
type GeneratedRow = RpcDef['Returns'][number]

/**
 * One row per player who has at least one matching event.
 * Typegen marks every column of a RETURNS TABLE as non-null because Postgres
 * can't describe nullability there, but players.position and players.team_name
 * ARE nullable — so those two are widened to `string | null` here.
 */
export type PlayerEventCountRow = Omit<
  GeneratedRow,
  'player_position' | 'team_name'
> & {
  player_position: string | null
  team_name: string | null
}

/** Same optional filters the SQL function takes. Omit or null = don't filter. */
export type PlayerEventCountFilters = {
  gameId?: string | null
  /** Inclusive ISO dates (YYYY-MM-DD), compared with games.played_on. */
  playedFrom?: string | null
  playedTo?: string | null
}

export async function getPlayerEventCounts(
  filters: PlayerEventCountFilters = {},
): Promise<Array<PlayerEventCountRow>> {
  const args: RpcDef['Args'] = {
    p_game_id: filters.gameId ?? undefined,
    p_played_from: filters.playedFrom ?? undefined,
    p_played_to: filters.playedTo ?? undefined,
  }

  const { data, error } = await supabase.rpc('player_event_counts', args)

  if (error) {
    throw new Error(`player_event_counts failed: ${error.message}`)
  }
  return data
}
