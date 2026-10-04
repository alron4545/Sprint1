// src/routes/scouting/players.tsx — Sprint 3 smoke-test page: scout player list.
//
// Thin UI over the public hooks only (src/lib/scouting/hooks.ts): no Supabase
// client, no fetch, no fake data. Filters are the two the requirements brief
// names for players: position and team. Their options come from the real
// player list, so they always match what is actually in the database.
// Routed via app/routes/scouting/players.tsx (this project's routes folder).
import { useState } from 'react'
import { usePlayers } from '../../lib/scouting/hooks'

function uniqueSorted(values: Array<string | null | undefined>): Array<string> {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort()
}

export function PlayersPage() {
  const [position, setPosition] = useState('')
  const [teamName, setTeamName] = useState('')

  // Unfiltered list only feeds the filter dropdowns.
  const everyone = usePlayers()
  const players = usePlayers({
    position: position || null,
    teamName: teamName || null,
  })

  const positions = uniqueSorted(everyone.data?.map((p) => p.position) ?? [])
  const teams = uniqueSorted(everyone.data?.map((p) => p.team_name) ?? [])

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Scouting: players</h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          Position
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">All</option>
            {positions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Team
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          >
            <option value="">All</option>
            {teams.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {players.isPending ? (
        <p className="mt-4 text-sm text-slate-600">Loading players…</p>
      ) : players.isError ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          Could not load players: {players.error.message}
        </p>
      ) : players.data.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No players match these filters.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
          {players.data.map((player) => (
            <li
              key={player.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between"
            >
              <span className="font-medium text-slate-900">
                {player.full_name}
              </span>
              <span className="text-sm text-slate-600">
                {player.position ?? 'position unknown'}
                {player.team_name ? ` · ${player.team_name}` : ''}
                {player.jersey_number != null ? ` · #${player.jersey_number}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
