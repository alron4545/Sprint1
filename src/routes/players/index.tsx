import { Link, createFileRoute } from '@tanstack/react-router'
import { listPlayers } from '../../server/directoryLoader'

export const Route = createFileRoute('/players/')({
  loader: () => listPlayers(),
  component: PlayersIndex,
})

function PlayersIndex() {
  const players = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Roster</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Players
        </h1>
        <p className="mb-6 max-w-2xl text-base text-[var(--sea-ink-soft)]">
          {players.length} player{players.length === 1 ? '' : 's'} on the
          roster. Select a player to open their bookmarkable detail page.
        </p>

        <ul className="m-0 grid gap-3 p-0 sm:grid-cols-2">
          {players.map((player) => (
            <li key={player.id} className="list-none">
              <Link
                to="/players/$playerId"
                params={{ playerId: player.id }}
                className="island-shell feature-card block rounded-2xl p-4 no-underline"
              >
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  #{player.number} {player.name}
                </p>
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  {player.position} · {player.team} · {player.status}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
