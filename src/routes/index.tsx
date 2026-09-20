import { Link, createFileRoute } from '@tanstack/react-router'
import { listGames, listPlayers } from '../server/directoryLoader'

export const Route = createFileRoute('/')({
  loader: () => ({
    playerCount: listPlayers().length,
    gameCount: listGames().length,
  }),
  component: App,
})

function App() {
  const { playerCount, gameCount } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Hockey Operations</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Hockey Ops Player Directory
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          A directory staff can open on arena wifi and use right away —
          {playerCount} player{playerCount === 1 ? '' : 's'} and {gameCount}{' '}
          game{gameCount === 1 ? '' : 's'} are already loaded below, no
          spinner required.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/players"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            View Players
          </Link>
          <Link
            to="/games"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            View Games
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'Fast on Arena Wifi',
            'Directory content is server-rendered, so it shows up in the first HTML response instead of waiting on a spinner.',
          ],
          [
            'Bookmarkable Players',
            'Every player has a stable URL like /players/42 that reopens the same page every time.',
          ],
          [
            'Consistent Nav',
            'Home, Players, and Games are reachable from every page shell.',
          ],
          [
            'Type-Safe Routing',
            'Links and params stay in sync across every page.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Sprint 1 status</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>Routes: Home, Players, Player detail, Games.</li>
          <li>
            Data comes from a seed module (
            <code>src/data/hockeySeed.ts</code>) behind a small loader (
            <code>src/server/directoryLoader.ts</code>) — real
            database-backed data is a later sprint.
          </li>
          <li>
            Visiting an unknown player id shows a not-found state instead of
            crashing.
          </li>
        </ul>
      </section>
    </main>
  )
}
