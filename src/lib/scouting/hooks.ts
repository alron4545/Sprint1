// src/lib/scouting/hooks.ts
//
// Thin TanStack Query wrappers over the scouting data-access helpers. Each
// hook's queryFn only calls an existing helper (queries.ts / rpc.ts), so the
// typed fetching stays in one place, and result types flow from those helpers.
// Hooks that need an id use skipToken: no id, no request (and the types stay
// honest — no `as string`). Reads only; mutation hooks and invalidation come
// in the next step. Components must use these hooks, not the Supabase client.

import { skipToken, useQuery } from '@tanstack/react-query'
import { scoutingKeys } from './query-keys'
import {
  getGameById,
  getPlayerById,
  listGames,
  listPlayers,
  listScoutingEvents,
  listScoutingEventsWithDetails,
  type GameListFilters,
  type PlayerListFilters,
  type ScoutingEventFilters,
} from './queries'
import { getPlayerEventCounts, type PlayerEventCountFilters } from './rpc'

export function usePlayers(filters: PlayerListFilters = {}) {
  return useQuery({
    queryKey: scoutingKeys.playerList(filters),
    queryFn: () => listPlayers(filters),
  })
}

export function usePlayer(playerId: string | null | undefined) {
  return useQuery({
    queryKey: scoutingKeys.playerDetail(playerId ?? ''),
    queryFn: playerId ? () => getPlayerById(playerId) : skipToken,
  })
}

export function useGames(filters: GameListFilters = {}) {
  return useQuery({
    queryKey: scoutingKeys.gameList(filters),
    queryFn: () => listGames(filters),
  })
}

export function useGame(gameId: string | null | undefined) {
  return useQuery({
    queryKey: scoutingKeys.gameDetail(gameId ?? ''),
    queryFn: gameId ? () => getGameById(gameId) : skipToken,
  })
}

export function useScoutingEvents(filters: ScoutingEventFilters = {}) {
  return useQuery({
    queryKey: scoutingKeys.eventList(filters),
    queryFn: () => listScoutingEvents(filters),
  })
}

export function useScoutingEventsWithDetails(filters: ScoutingEventFilters = {}) {
  return useQuery({
    queryKey: scoutingKeys.eventListWithDetails(filters),
    queryFn: () => listScoutingEventsWithDetails(filters),
  })
}

export function usePlayerEventCounts(filters: PlayerEventCountFilters = {}) {
  return useQuery({
    queryKey: scoutingKeys.playerEventCounts(filters),
    queryFn: () => getPlayerEventCounts(filters),
  })
}
