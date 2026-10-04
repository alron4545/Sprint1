// src/lib/scouting/query-keys.ts
//
// Hierarchical query-key factory for the scouting board. A key is a cache
// address, built root → entity → list/detail/aggregate → filters, so a later
// mutation can invalidate a whole branch by prefix:
//   scoutingKeys.events()       → every events list, any filters
//   scoutingKeys.aggregates()   → every aggregate/RPC result
// Filters are part of the address so different filters never share an entry.
// Filter types come from the data-access helpers, so keys and fetchers can't drift.

import type {
  GameListFilters,
  PlayerListFilters,
  ScoutingEventFilters,
} from './queries'
import type { PlayerEventCountFilters } from './rpc'

/**
 * Drop null/undefined entries so { gameId: null } and {} (the same query)
 * share one cache entry instead of two.
 */
function compact<T extends object>(filters: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null),
  ) as Partial<T>
}

export const scoutingKeys = {
  all: ['scouting'] as const,

  players: () => [...scoutingKeys.all, 'players'] as const,
  playerLists: () => [...scoutingKeys.players(), 'list'] as const,
  playerList: (filters: PlayerListFilters = {}) =>
    [...scoutingKeys.playerLists(), compact(filters)] as const,
  playerDetail: (playerId: string) =>
    [...scoutingKeys.players(), 'detail', playerId] as const,

  games: () => [...scoutingKeys.all, 'games'] as const,
  gameLists: () => [...scoutingKeys.games(), 'list'] as const,
  gameList: (filters: GameListFilters = {}) =>
    [...scoutingKeys.gameLists(), compact(filters)] as const,
  gameDetail: (gameId: string) =>
    [...scoutingKeys.games(), 'detail', gameId] as const,

  events: () => [...scoutingKeys.all, 'events'] as const,
  eventLists: () => [...scoutingKeys.events(), 'list'] as const,
  eventList: (filters: ScoutingEventFilters = {}) =>
    [...scoutingKeys.eventLists(), compact(filters)] as const,
  eventDetailLists: () => [...scoutingKeys.events(), 'list-with-details'] as const,
  eventListWithDetails: (filters: ScoutingEventFilters = {}) =>
    [...scoutingKeys.eventDetailLists(), compact(filters)] as const,

  aggregates: () => [...scoutingKeys.all, 'aggregates'] as const,
  playerEventCounts: (filters: PlayerEventCountFilters = {}) =>
    [...scoutingKeys.aggregates(), 'player-event-counts', compact(filters)] as const,
}
