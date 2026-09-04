// Shared search-param validators. These NEVER throw: invalid values are
// simply dropped so a bad/pasted URL degrades gracefully instead of
// crashing the page. All keys are optional — "not present" is itself a
// valid, meaningful state ("no filter applied"), which also keeps plain
// links to these routes (e.g. from nav) type-checking without having to
// supply search params.

export type PlayerPosition = 'F' | 'D' | 'G'
export type PlayerStatus = 'active' | 'ir' | 'all'

export interface PlayersSearch {
  /** Omitted means "any position". */
  position?: PlayerPosition
  /** Omitted is treated as "all" by the page — see players/index.tsx. */
  status?: PlayerStatus
}

const PLAYER_POSITIONS: readonly PlayerPosition[] = ['F', 'D', 'G']
const PLAYER_STATUSES: readonly PlayerStatus[] = ['active', 'ir', 'all']

export function validatePlayersSearch(
  search: Record<string, unknown>,
): PlayersSearch {
  const position = PLAYER_POSITIONS.includes(search.position as PlayerPosition)
    ? (search.position as PlayerPosition)
    : undefined

  const status = PLAYER_STATUSES.includes(search.status as PlayerStatus)
    ? (search.status as PlayerStatus)
    : undefined

  return { position, status }
}

export interface GamesSearch {
  /** Omitted means "any team". Stored upper-cased. */
  team?: string
  /** Plain YYYY-MM-DD string for this sprint; omitted means "any date". */
  date?: string
  /**
   * Optional cross-link context set by a player detail page (Step 10).
   * The seed data has no games-per-player relation yet, so this labels
   * the view ("games context for this player") rather than filtering the
   * list — see docs in games/index.tsx for the honest caveat.
   */
  player?: string
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function validateGamesSearch(
  search: Record<string, unknown>,
): GamesSearch {
  const rawTeam = search.team
  const team =
    typeof rawTeam === 'string' && rawTeam.trim().length > 0
      ? rawTeam.trim().toUpperCase()
      : undefined

  const rawDate = search.date
  const date =
    typeof rawDate === 'string' && DATE_PATTERN.test(rawDate)
      ? rawDate
      : undefined

  const rawPlayer = search.player
  const player =
    typeof rawPlayer === 'string' && rawPlayer.trim().length > 0
      ? rawPlayer.trim()
      : undefined

  return { team, date, player }
}
