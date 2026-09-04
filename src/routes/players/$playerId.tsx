// Dynamic segment $playerId -> params.playerId (TanStack Router file routing).
// This is a bookmarkable detail shell only: no server data loading yet
// (that lands in a later sprint step).
import { createFileRoute, Link } from '@tanstack/react-router'
import { parsePlayerIdParam } from '../../lib/playerParams'

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
  component: PlayerDetailPage,
})

function PlayerDetailPage() {
  const { playerId } = Route.useParams()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="mb-4 text-sm">
        <Link to="/players" className="text-sky-700 underline">
          &larr; Back to players
        </Link>
      </p>
      <h1 className="text-2xl font-bold text-slate-900">Player detail</h1>
      <p className="mt-2 text-slate-700">
        Bookmarkable sheet for player{' '}
        <span className="font-mono font-medium">{playerId}</span>
      </p>
      <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
        Roster fields and server-loaded stats land in a later step. This
        shell proves the path param works for hockey ops links.
      </p>
    </main>
  )
}
