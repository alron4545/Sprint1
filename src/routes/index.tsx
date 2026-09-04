import { createFileRoute, Link } from '@tanstack/react-router'
import { listGames, listPlayers } from '../server/directoryLoader'

export const Route = createFileRoute('/')({
  loader: () => {
    const players = listPlayers()
    const games = listGames()
    const nextGame = [...games]
      .filter((g) => g.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date))[0]
    return {
      playerCount: players.length,
      activePlayerCount: players.filter((p) => p.status === 'active').length,
      gameCount: games.length,
      nextGame,
    }
  },
  component: HomePage,
})

function HomePage() {
  const { playerCount, activePlayerCount, gameCount, nextGame } =
    Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Hockey Ops Player Directory
      </h1>
      <p className="mt-2 text-slate-600">
        Staff landing page for roster and schedule entry points. Open{' '}
        <Link to="/players" className="text-sky-700 underline">
          Players
        </Link>{' '}
        for the directory list or{' '}
        <Link to="/games" className="text-sky-700 underline">
          Games
        </Link>{' '}
        for upcoming matchups.
      </p>
      <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-700">
        {playerCount} players on the roster ({activePlayerCount} active),{' '}
        {gameCount} games on the schedule.
        {nextGame ? (
          <>
            {' '}
            Next up: {nextGame.venue === 'home' ? 'vs' : '@'} {nextGame.opponent}{' '}
            on {nextGame.date}.
          </>
        ) : null}
      </p>
    </main>
  )
}
