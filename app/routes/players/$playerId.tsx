// Dynamic segment $playerId -> params.playerId (TanStack Router file routing).
import { createFileRoute, Link } from '@tanstack/react-router'
import { parsePlayerIdParam } from '../../lib/playerParams'
import { getPlayerById } from '../../server/directoryLoader'
import { NotFoundPlayer } from '../../components/NotFoundPlayer'

export const Route = createFileRoute('/players/$playerId')({
  // Validate path params so TypeScript and runtime agree on playerId.
  params: {
    parse: (raw) => ({
      playerId: parsePlayerIdParam(raw.playerId),
    }),
    stringify: ({ playerId }) => ({
      playerId: String(playerId),
    }),
  },
  // Server-rendered on first load, so an unknown id shows a real "not
  // found" message in the first HTML response, not a spinner then a
  // client-side error.
  loader: ({ params }) => ({
    player: getPlayerById(params.playerId) ?? null,
  }),
  component: PlayerDetailPage,
})

function PlayerDetailPage() {
  const { playerId } = Route.useParams()
  const { player } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="mb-4 text-sm">
        <Link to="/players" className="text-sky-700 underline">
          &larr; Back to players
        </Link>
      </p>

      {player ? (
        <>
          <h1 className="text-2xl font-bold text-slate-900">
            #{player.number} {player.name}
          </h1>
          <p className="mt-2 text-slate-700">
            {player.position} &mdash; {player.team}
            {player.status === 'ir' ? ' (Injured Reserve)' : ''}
          </p>
          <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
            Player id{' '}
            <span className="font-mono font-medium">{playerId}</span>. Live
            stats and roster history land in a later sprint.
          </p>
          <p className="mt-4 text-sm">
            <Link
              to="/games"
              search={{ player: player.id }}
              className="font-medium text-sky-700 underline underline-offset-2"
            >
              View games &mdash; {player.name}
            </Link>
          </p>
        </>
      ) : (
        <NotFoundPlayer playerId={playerId} />
      )}
    </main>
  )
}
