import { createFileRoute, Link } from '@tanstack/react-router'
import { validateGamesSearch } from '../../lib/searchSchemas'

export const Route = createFileRoute('/games/')({
  validateSearch: validateGamesSearch,
  component: GamesIndexPage,
})

// Seed/demo rows for Sprint 1. Real Supabase-backed data arrives in a
// later sprint (server functions step) — see docs/route-map.md.
const demoGames = [
  { id: 'g1', opponent: 'Riverton Rapids', team: 'BOS', date: '2026-09-12', kind: 'Home' },
  { id: 'g2', opponent: 'Harbor City', team: 'NYR', date: '2026-09-15', kind: 'Away' },
  { id: 'g3', opponent: 'Summit Peaks', team: 'BOS', date: '2026-09-20', kind: 'Home' },
]

function GamesIndexPage() {
  const search = Route.useSearch()

  const filtered = demoGames.filter((game) => {
    const teamMatches = !search.team || game.team === search.team
    const dateMatches = !search.date || game.date === search.date
    return teamMatches && dateMatches
  })

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Games</h1>
      <p className="mt-2 text-slate-600">
        Schedule view for upcoming and recent games.
      </p>

      <p className="mt-4 text-sm text-slate-600">
        Active filters: team={' '}
        <span className="font-mono">{search.team ?? 'all'}</span>, date={' '}
        <span className="font-mono">{search.date ?? 'all'}</span>
      </p>

      <nav aria-label="Game filters" className="mt-2 flex flex-wrap gap-3 text-sm">
        <Link
          to="/games"
          search={(prev) => ({ ...prev, team: 'BOS' })}
          className="text-sky-700 underline"
        >
          BOS games
        </Link>
        <Link
          to="/games"
          search={(prev) => ({ ...prev, date: '2026-09-12' })}
          className="text-sky-700 underline"
        >
          Games on 2026-09-12
        </Link>
        <Link
          to="/games"
          search={{}}
          className="text-sky-700 underline"
        >
          Clear filters
        </Link>
      </nav>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No games match these filters.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
          {filtered.map((game) => (
            <li key={game.id}>
              <span className="font-medium">{game.date}</span> &mdash;{' '}
              {game.kind} vs {game.opponent}{' '}
              <span className="text-sm text-slate-500">({game.team})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
