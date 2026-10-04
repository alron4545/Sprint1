// src/lib/scouting/rpc.ts
//
// Calls the set-based Postgres function player_event_counts()
// (supabase/migrations/002_scouting_aggregates_rpc.sql): ONE round trip that
// returns per-player event and goal totals, instead of fetching every event
// and counting in the browser.
//
// The generated Database type doesn't know about this function yet — the next
// step regenerates src/types/database.ts. Until then PlayerEventCountRow is a
// small local type, and the single cast below is the only place the client's
// types are narrowed by hand. Delete the cast and use supabase.rpc directly
// once typegen includes the function.

import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'

/** One row per player who has at least one matching event. */
export type PlayerEventCountRow = {
  player_id: string
  player_name: string
  player_position: string | null
  team_name: string | null
  event_count: number
  goal_count: number
}

/** Same optional filters the SQL function takes. Omit or null = don't filter. */
export type PlayerEventCountFilters = {
  gameId?: string | null
  /** Inclusive ISO dates (YYYY-MM-DD), compared with games.played_on. */
  playedFrom?: string | null
  playedTo?: string | null
}

type PlayerEventCountsRpc = (
  fn: 'player_event_counts',
  args: {
    p_game_id: string | null
    p_played_from: string | null
    p_played_to: string | null
  },
) => PromiseLike<{
  data: Array<PlayerEventCountRow> | null
  error: PostgrestError | null
}>

// TEMPORARY (until typegen covers the RPC): see file header.
const callRpc = supabase.rpc.bind(supabase) as unknown as PlayerEventCountsRpc

export async function getPlayerEventCounts(
  filters: PlayerEventCountFilters = {},
): Promise<Array<PlayerEventCountRow>> {
  const { data, error } = await callRpc('player_event_counts', {
    p_game_id: filters.gameId ?? null,
    p_played_from: filters.playedFrom ?? null,
    p_played_to: filters.playedTo ?? null,
  })

  if (error) {
    throw new Error(`player_event_counts failed: ${error.message}`)
  }
  return data ?? []
}
