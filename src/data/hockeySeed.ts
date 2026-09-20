// Seed/demo data for the Hockey Ops Player Directory (Sprint 1).
//
// This stands in for the real database. Sprint 1's requirement is that
// real-looking directory content appears in the first server-rendered HTML
// response — it does not require live data yet (see docs/requirements-brief.md).
//
// `directoryLoader.ts` is the only module that should read from this file.
// Route components should go through that loader, not import this seed
// module directly, so a later sprint can swap the seed array for a real
// database query without touching any route/component code.

export type PlayerPosition = 'C' | 'LW' | 'RW' | 'D' | 'G'

export type PlayerRosterStatus = 'active' | 'injured' | 'reserve'

export interface SeedPlayer {
  id: string
  name: string
  number: number
  position: PlayerPosition
  team: string
  status: PlayerRosterStatus
}

export interface SeedGame {
  id: string
  opponent: string
  date: string // ISO date, e.g. "2026-10-04"
  location: 'home' | 'away'
  result?: string
}

export const seedPlayers: SeedPlayer[] = [
  {
    id: '1',
    name: 'Jordan Reyes',
    number: 8,
    position: 'C',
    team: 'Ice Hawks',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sam Okafor',
    number: 21,
    position: 'LW',
    team: 'Ice Hawks',
    status: 'active',
  },
  {
    id: '3',
    name: 'Priya Chandra',
    number: 14,
    position: 'RW',
    team: 'Ice Hawks',
    status: 'injured',
  },
  {
    id: '4',
    name: 'Mateo Silva',
    number: 4,
    position: 'D',
    team: 'Ice Hawks',
    status: 'active',
  },
  {
    id: '5',
    name: 'Casey Lindqvist',
    number: 29,
    position: 'D',
    team: 'Ice Hawks',
    status: 'active',
  },
  {
    id: '6',
    name: 'Noah Fitzgerald',
    number: 33,
    position: 'G',
    team: 'Ice Hawks',
    status: 'active',
  },
  {
    id: '7',
    name: 'Elena Vasquez',
    number: 17,
    position: 'C',
    team: 'Ice Hawks',
    status: 'reserve',
  },
]

export const seedGames: SeedGame[] = [
  {
    id: '1',
    opponent: 'Riverside Otters',
    date: '2026-09-20',
    location: 'home',
  },
  {
    id: '2',
    opponent: 'Northgate Wolves',
    date: '2026-09-27',
    location: 'away',
  },
  {
    id: '3',
    opponent: 'Bay City Sharks',
    date: '2026-10-04',
    location: 'home',
  },
  {
    id: '4',
    opponent: 'Union Miners',
    date: '2026-09-13',
    location: 'away',
    result: 'W 4-2',
  },
  {
    id: '5',
    opponent: 'Prairie Comets',
    date: '2026-09-06',
    location: 'home',
    result: 'L 1-3',
  },
]
