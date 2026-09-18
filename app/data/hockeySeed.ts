// Seed/demo hockey ops data for Sprint 1. Fake but realistic — this proves
// server-side rendering works before real Supabase-backed data lands in a
// later sprint. See docs/requirements-brief.md for the first-paint goals
// this data exists to satisfy.

export type PlayerPosition = 'F' | 'D' | 'G'
export type PlayerRosterStatus = 'active' | 'ir'

export type SeedPlayer = {
  id: string
  name: string
  position: PlayerPosition
  number: number
  team: string
  // Extends the lesson's scaffold: docs/search-params-notes.md already
  // ships a working "active only / all statuses" filter on /players, so
  // the seed model needs a status field for that filter to keep meaning
  // something once real data replaces static placeholders.
  status: PlayerRosterStatus
}

export type GameVenue = 'home' | 'away'
export type GameStatus = 'scheduled' | 'final'

export type SeedGame = {
  id: string
  opponent: string
  date: string // ISO date (YYYY-MM-DD)
  venue: GameVenue
  status: GameStatus
}

export const seedPlayers: SeedPlayer[] = [
  { id: 'p-17', name: 'Alex Mercer', position: 'F', number: 17, team: 'Home Club', status: 'active' },
  { id: 'p-4', name: 'Jordan Lee', position: 'D', number: 4, team: 'Home Club', status: 'active' },
  { id: 'p-30', name: 'Sam Ortiz', position: 'G', number: 30, team: 'Home Club', status: 'ir' },
  { id: 'p-9', name: 'Riley Chen', position: 'F', number: 9, team: 'Home Club', status: 'active' },
  { id: 'p-22', name: 'Casey Novak', position: 'D', number: 22, team: 'Home Club', status: 'active' },
  { id: 'p-1', name: 'Morgan Ellis', position: 'G', number: 1, team: 'Home Club', status: 'active' },
]

export const seedGames: SeedGame[] = [
  { id: 'g-1', opponent: 'North Bay', date: '2026-03-14', venue: 'home', status: 'scheduled' },
  { id: 'g-2', opponent: 'River City', date: '2026-03-18', venue: 'away', status: 'scheduled' },
  { id: 'g-3', opponent: 'Lakeside', date: '2026-03-02', venue: 'home', status: 'final' },
]
