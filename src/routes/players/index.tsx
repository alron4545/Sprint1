import { createFileRoute, Link } from '@tanstack/react-router'
import { validatePlayersSearch } from '../../lib/searchSchemas'

export const Route = createFileRoute('/players/')({
  validateSearch: validatePlayersSearch,
  component: PlayersIndexPage,
})

// Seed/demo rows for Sprint 1. Real Supabase-backed data arrives in a
// later sprint (server functions step) — see docs/route-map.md.
const demoPlayers = [
  {
    id: '17',
    name: 'A. Forward',
    position: 'F' as const,
    positionLabel: 'Forward',
    status: 'active' as const,
  },
  {
    id: '4',
    name: 'B. Defense',
    position: 'D' as const,
    positionLabel: 'Defense',
    status: 'active' as const,
  },
  {
    id: '30',
    name: 'C. Goalie',
    position: 'G' as const,
    positionLabel: 'Goalie',
    status: 'ir' as const,
  },
]

function PlayersIndexPage() {
  const search = Route.useSearch()
  // No status in the URL means "show everyone" — see docs/search-params-notes.md.
  const activeStatus = search.status ?? 'all'

  const filtered = demoPlayers.filter((player) => {
    const positionMatches = !search.position || player.position === search.position
    const statusMatches = activeStatus === 'all' || player.status === activeStatus
    return positionMatches && statusMatches
  })

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Players</h1>
      <p className="mt-2 text-slate-600">
        Roster directory index for hockey operations staff. Each player has
        a bookmarkable detail page.
      </p>

      <p className="mt-4 text-sm text-slate-600">
        Active filters: position={' '}
        <span className="font-mono">{search.position ?? 'all'}</span>, status={' '}
        <span className="font-mono">{activeStatus}</span>
      </p>

      <nav aria-label="Player filters" className="mt-2 flex flex-wrap gap-3 text-sm">
        <Link
          to="/players"
          search={{ ...search, position: undefined }}
          className="text-sky-700 underline"
        >
          All positions
        </Link>
        <Link
          to="/players"
          search={{ ...search, position: 'F' }}
          className="text-sky-700 underline"
        >
          Forwards
        </Link>
        <Link
          to="/players"
          search={{ ...search, position: 'D' }}
          className="text-sky-700 underline"
        >
          Defense
        </Link>
        <Link
          to="/players"
          search={{ ...search, position: 'G' }}
          className="text-sky-700 underline"
        >
          Goalies
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          |
        </span>
        <Link
          to="/players"
          search={{ ...search, status: 'active' }}
          className="text-sky-700 underline"
        >
          Active only
        </Link>
        <Link
          to="/players"
          search={{ ...search, status: undefined }}
          className="text-sky-700 underline"
        >
          All statuses
        </Link>
      </nav>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No players match these filters.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
          {filtered.map((player) => (
            <li key={player.id}>
              <Link
                to="/players/$playerId"
                params={{ playerId: player.id }}
                className="text-sky-700 underline hover:text-sky-900"
              >
                {player.name}
              </Link>{' '}
              <span className="text-sm text-slate-500">
                &mdash; {player.positionLabel}
                {player.status === 'ir' ? ' (IR)' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
