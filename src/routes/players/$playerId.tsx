import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getPlayerById } from '../../server/directoryLoader'

export const Route = createFileRoute('/players/$playerId')({
  loader: ({ params }) => {
    const player = getPlayerById(params.playerId)
    if (!player) {
      // Acceptance criteria: an invalid id must show a clear not-found
      // state, not a raw crash page.
      throw notFound()
    }
    return player
  },
  component: PlayerDetail,
  notFoundComponent: PlayerNotFound,
})

function PlayerDetail() {
  const player = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Player #{player.id}</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          #{player.number} {player.name}
        </h1>
        <p className="mb-6 max-w-2xl text-base text-[var(--sea-ink-soft)]">
          {player.position} for the {player.team} &middot; Status:{' '}
          {player.status}
        </p>
        <Link
          to="/players"
          className="nav-link rounded-full border border-[var(--chip-line)] px-4 py-2 text-sm font-semibold no-underline"
        >
          &larr; Back to Players
        </Link>
      </section>
    </main>
  )
}

function PlayerNotFound() {
  const { playerId } = Route.useParams()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 text-center sm:px-10">
        <p className="island-kicker mb-3">Not found</p>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          No player matches &ldquo;{playerId}&rdquo;
        </h1>
        <p className="mb-6 text-base text-[var(--sea-ink-soft)]">
          Double-check the player id in the URL, or browse the full roster.
        </p>
        <Link
          to="/players"
          className="nav-link rounded-full border border-[var(--chip-line)] px-4 py-2 text-sm font-semibold no-underline"
        >
          &larr; Back to Players
        </Link>
      </section>
    </main>
  )
}
