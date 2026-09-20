import { createFileRoute } from '@tanstack/react-router'
import { listGames } from '../../server/directoryLoader'

export const Route = createFileRoute('/games/')({
  loader: () => listGames(),
  component: GamesIndex,
})

function GamesIndex() {
  const games = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Schedule</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Games
        </h1>
        <p className="mb-6 max-w-2xl text-base text-[var(--sea-ink-soft)]">
          {games.length} game{games.length === 1 ? '' : 's'} on the schedule.
        </p>

        <ul className="m-0 grid gap-3 p-0">
          {games.map((game) => (
            <li
              key={game.id}
              className="island-shell feature-card flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4"
            >
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  {game.location === 'home' ? 'vs.' : '@'} {game.opponent}
                </p>
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  {game.date}
                </p>
              </div>
              {game.result ? (
                <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]">
                  {game.result}
                </span>
              ) : (
                <span className="rounded-full border border-[var(--chip-line)] px-3 py-1 text-sm text-[var(--sea-ink-soft)]">
                  Upcoming
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
