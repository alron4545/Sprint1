import { createFileRoute, Link } from '@tanstack/react-router'
import { validatePlayersSearch } from '../../lib/searchSchemas'
import { listPlayers } from '../../server/directoryLoader'

export const Route = createFileRoute('/players/')({
  validateSearch: validatePlayersSearch,
  loaderDeps: ({ search }) => ({ search }),
  // Loader runs on the server for the initial request (SSR) and again on
  // the client for in-app navigation — so the search filters affect the
  // very first HTML, not just a later client refetch.
  loader: ({ deps: { search } }) =>
    listPlayers({ position: search.position, status: search.status ?? 'all' }),
  component: PlayersIndexPage,
})

function PlayersIndexPage() {
  const search = Route.useSearch()
  const players = Route.useLoaderData()
  const activeStatus = search.status ?? 'all'

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Players</h1>
      <p className="mt-2 text-slate-600">
        Roster directory for hockey operations staff. Each player has a
        bookmarkable detail page.
      </p>

      <p className="mt-4 text-sm text-slate-600">
        Active filters: position={' '}
        <span className="font-mono">{search.position ?? 'all'}</span>, status={' '}
        <span className="font-mono">{activeStatus}</span>
      </p>

      <nav aria-label="Player filters" className="mt-2 flex flex-wrap gap-3 text-sm">
        <Link to="/players" search={{ ...search, position: undefined }} className="text-sky-700 underline">
          All positions
        </Link>
        <Link to="/players" search={{ ...search, position: 'F' }} className="text-sky-700 underline">
          Forwards
        </Link>
        <Link to="/players" search={{ ...search, position: 'D' }} className="text-sky-700 underline">
          Defense
        </Link>
        <Link to="/players" search={{ ...search, position: 'G' }} className="text-sky-700 underline">
          Goalies
        </Link>
        <span aria-hidden="true" className="text-slate-300">|</span>
        <Link to="/players" search={{ ...search, status: 'active' }} className="text-sky-700 underline">
          Active only
        </Link>
        <Link to="/players" search={{ ...search, status: undefined }} className="text-sky-700 underline">
          All statuses
        </Link>
      </nav>

      {players.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No players match these filters.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                to="/players/$playerId"
                params={{ playerId: player.id }}
                className="text-sky-700 underline hover:text-sky-900"
              >
                #{player.number} {player.name}
              </Link>{' '}
              <span className="text-sm text-slate-500">
                &mdash; {player.position}
                {player.status === 'ir' ? ' (IR)' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
