// src/routes/scouting/aggregates.tsx — Sprint 3 smoke-test page: per-player totals.
//
// Thin UI over the public hooks only. Totals come from the set-based
// player_event_counts RPC (one database call, no counting in the browser).
// The optional game filter maps to the RPC's p_game_id.
// Routed via app/routes/scouting/aggregates.tsx.
import { useState } from 'react'
import { useGames, usePlayerEventCounts } from '../../lib/scouting/hooks'

export function AggregatesPage() {
  const [gameId, setGameId] = useState('')
  const games = useGames()
  const totals = usePlayerEventCounts({ gameId: gameId || null })

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Scouting: event totals by player
      </h1>

      <label className="mt-4 flex items-center gap-2 text-sm">
        Game
        <select
          className="rounded border border-slate-300 px-2 py-1"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        >
          <option value="">All games</option>
          {games.data?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.played_on} vs {g.opponent}
            </option>
          ))}
        </select>
      </label>

      {totals.isPending ? (
        <p className="mt-4 text-sm text-slate-600">Loading totals…</p>
      ) : totals.isError ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          Could not load totals: {totals.error.message}
        </p>
      ) : totals.data.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No events logged for this selection yet.
        </p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Player</th>
              <th className="py-2">Position</th>
              <th className="py-2">Team</th>
              <th className="py-2">Goals</th>
              <th className="py-2">Events</th>
            </tr>
          </thead>
          <tbody>
            {totals.data.map((row) => (
              <tr key={row.player_id} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-900">
                  {row.player_name}
                </td>
                <td className="py-2">{row.player_position ?? '—'}</td>
                <td className="py-2">{row.team_name ?? '—'}</td>
                <td className="py-2">{row.goal_count}</td>
                <td className="py-2">{row.event_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
