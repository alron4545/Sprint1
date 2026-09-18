import { createFileRoute, Link } from '@tanstack/react-router'
import { validateGamesSearch } from '../../lib/searchSchemas'
import { getPlayerById, listGames } from '../../server/directoryLoader'

export const Route = createFileRoute('/games/')({
  validateSearch: validateGamesSearch,
  loaderDeps: ({ search }) => ({ search }),
  // `team` (URL param, see docs/search-params-notes.md) filters by opponent
  // name — the seed schedule has no team-code field, only opponent names.
  // `player`, when present, is context set by a player-detail page link —
  // the seed data has no games-per-player relation yet, so it labels the
  // view rather than filtering the list (see docs/search-params-notes.md).
  loader: ({ deps: { search } }) => ({
    games: listGames({ opponent: search.team, date: search.date }),
    contextPlayer: search.player ? getPlayerById(search.player) ?? null : null,
    contextPlayerId: search.player ?? null,
  }),
  component: GamesIndexPage,
})

function GamesIndexPage() {
  const search = Route.useSearch()
  const { games, contextPlayer, contextPlayerId } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Games</h1>
      <p className="mt-2 text-slate-600">
        Schedule for upcoming and recent games.
      </p>

      {contextPlayerId ? (
        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
          {contextPlayer ? (
            <>
              Showing games context for player{' '}
              <span className="font-medium">{contextPlayer.name}</span>.
              Player-specific schedules aren&rsquo;t modeled yet, so this is
              the full schedule.{' '}
              <Link
                to="/players/$playerId"
                params={{ playerId: contextPlayer.id }}
                className="font-medium text-sky-700 underline"
              >
                Back to {contextPlayer.name}
              </Link>
            </>
          ) : (
            <>
              Games context was requested for player id{' '}
              <span className="font-mono">{contextPlayerId}</span>, but no
              roster entry matches that id anymore &mdash; showing the full
              schedule instead.{' '}
              <Link to="/players" className="font-medium text-sky-700 underline">
                Back to players
              </Link>
            </>
          )}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-slate-600">
        Active filters: opponent contains={' '}
        <span className="font-mono">{search.team ?? 'all'}</span>, date={' '}
        <span className="font-mono">{search.date ?? 'all'}</span>
      </p>

      <nav aria-label="Game filters" className="mt-2 flex flex-wrap gap-3 text-sm">
        <Link to="/games" search={{ ...search, team: 'North Bay' }} className="text-sky-700 underline">
          North Bay games
        </Link>
        <Link to="/games" search={{ ...search, date: '2026-03-14' }} className="text-sky-700 underline">
          Games on 2026-03-14
        </Link>
        <Link to="/games" search={{}} className="text-sky-700 underline">
          Clear filters
        </Link>
      </nav>

      {games.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No games match these filters.
        </p>
      ) : (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
          {games.map((game) => (
            <li key={game.id}>
              <span className="font-medium">{game.date}</span> &mdash;{' '}
              {game.venue === 'home' ? 'vs' : '@'} {game.opponent}{' '}
              <span className="text-sm text-slate-500">
                ({game.status})
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
