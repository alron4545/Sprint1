// Server-side directory helpers. For Sprint 1 these just read the in-memory
// seed module (src/data/hockeySeed.ts) — no secrets, no network calls — but
// living under src/server/ marks this as the boundary that gets swapped for
// real Supabase reads in a later sprint without route files needing to
// change shape.
import {
  seedGames,
  seedPlayers,
  type GameVenue,
  type PlayerPosition,
  type PlayerRosterStatus,
  type SeedGame,
  type SeedPlayer,
} from '../data/hockeySeed'

export type ListPlayersFilters = {
  position?: PlayerPosition
  status?: PlayerRosterStatus | 'all'
}

export function listPlayers(filters?: ListPlayersFilters): SeedPlayer[] {
  let rows = [...seedPlayers]
  if (filters?.position) {
    rows = rows.filter((p) => p.position === filters.position)
  }
  if (filters?.status && filters.status !== 'all') {
    rows = rows.filter((p) => p.status === filters.status)
  }
  return rows
}

export function getPlayerById(playerId: string): SeedPlayer | undefined {
  return seedPlayers.find((p) => p.id === playerId)
}

export type ListGamesFilters = {
  /** Matches against `opponent`, case-insensitive substring. */
  opponent?: string
  date?: string
  venue?: GameVenue
}

export function listGames(filters?: ListGamesFilters): SeedGame[] {
  let rows = [...seedGames]
  if (filters?.opponent) {
    const needle = filters.opponent.toLowerCase()
    rows = rows.filter((g) => g.opponent.toLowerCase().includes(needle))
  }
  if (filters?.date) {
    rows = rows.filter((g) => g.date === filters.date)
  }
  if (filters?.venue) {
    rows = rows.filter((g) => g.venue === filters.venue)
  }
  return rows
}
