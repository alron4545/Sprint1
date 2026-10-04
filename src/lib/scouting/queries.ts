// src/lib/scouting/queries.ts
//
// Typed READ helpers for the scouting board. Every helper:
//   - takes a small filter-options object (nothing hardcoded inside),
//   - has an explicit return type built from the generated Database types,
//   - throws on a Supabase error instead of quietly returning empty data.
// No writes and no React/TanStack Query here — those are later steps.
// Table/column names come from src/types/database.ts; if the schema changes,
// regenerate that file and these helpers fail at typecheck, not in a browser.

import { supabase } from '../supabase/client'
import type { Tables } from '../../types/database'

export type PlayerRow = Tables<'players'>
export type GameRow = Tables<'games'>
export type ScoutingEventRow = Tables<'scouting_events'>

export type PlayerListFilters = {
  position?: string | null
  teamName?: string | null
}

export type GameListFilters = {
  /** Inclusive ISO dates (YYYY-MM-DD). A "season" is just a date range. */
  playedFrom?: string | null
  playedTo?: string | null
  opponent?: string | null
}

export type ScoutingEventFilters = {
  playerId?: string | null
  gameId?: string | null
  eventType?: string | null
}

/** One board row: an event plus the player and game it belongs to. */
export type ScoutingEventWithDetails = ScoutingEventRow & {
  player: Pick<PlayerRow, 'id' | 'full_name' | 'position' | 'team_name'>
  game: Pick<GameRow, 'id' | 'opponent' | 'played_on' | 'is_home'>
}

export async function listPlayers(
  filters: PlayerListFilters = {},
): Promise<Array<PlayerRow>> {
  let query = supabase.from('players').select('*').order('full_name')

  if (filters.position) query = query.eq('position', filters.position)
  if (filters.teamName) query = query.eq('team_name', filters.teamName)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPlayerById(id: string): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listGames(
  filters: GameListFilters = {},
): Promise<Array<GameRow>> {
  let query = supabase
    .from('games')
    .select('*')
    .order('played_on', { ascending: false })

  if (filters.playedFrom) query = query.gte('played_on', filters.playedFrom)
  if (filters.playedTo) query = query.lte('played_on', filters.playedTo)
  if (filters.opponent) query = query.eq('opponent', filters.opponent)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getGameById(id: string): Promise<GameRow | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listScoutingEvents(
  filters: ScoutingEventFilters = {},
): Promise<Array<ScoutingEventRow>> {
  let query = supabase
    .from('scouting_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.playerId) query = query.eq('player_id', filters.playerId)
  if (filters.gameId) query = query.eq('game_id', filters.gameId)
  if (filters.eventType) query = query.eq('event_type', filters.eventType)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function listScoutingEventsWithDetails(
  filters: ScoutingEventFilters = {},
): Promise<Array<ScoutingEventWithDetails>> {
  let query = supabase
    .from('scouting_events')
    .select(
      '*, player:players(id, full_name, position, team_name), game:games(id, opponent, played_on, is_home)',
    )
    .order('created_at', { ascending: false })

  if (filters.playerId) query = query.eq('player_id', filters.playerId)
  if (filters.gameId) query = query.eq('game_id', filters.gameId)
  if (filters.eventType) query = query.eq('event_type', filters.eventType)

  const { data, error } = await query
  if (error) throw error
  return data
}
