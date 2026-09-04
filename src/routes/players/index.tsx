import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/players/')({
  component: PlayersIndexPage,
})

// Seed/demo rows for Sprint 1. Real Supabase-backed data arrives in a
// later sprint (server functions step) — see docs/route-map.md.
const demoPlayers = [
  { id: '17', name: 'A. Forward', position: 'Forward' },
  { id: '4', name: 'B. Defense', position: 'Defense' },
  { id: '30', name: 'C. Goalie', position: 'Goalie' },
]

function PlayersIndexPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Players</h1>
      <p className="mt-2 text-slate-600">
        Roster directory index for hockey operations staff. Each player has
        a bookmarkable detail page.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
        {demoPlayers.map((player) => (
          <li key={player.id}>
            <Link
              to="/players/$playerId"
              params={{ playerId: player.id }}
              className="text-sky-700 underline hover:text-sky-900"
            >
              {player.name}
            </Link>{' '}
            <span className="text-sm text-slate-500">
              &mdash; {player.position}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
