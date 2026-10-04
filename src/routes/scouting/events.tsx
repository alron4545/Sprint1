// src/routes/scouting/events.tsx — Sprint 3 smoke-test page: event feed + log form.
//
// Thin UI over the public hooks only. The feed is the events-with-player-and-
// game read; the form calls the create-event mutation hook, which on success
// refreshes the event lists and the per-player totals (see
// docs/scouting-cache-invalidation-map.md) — so a newly logged event should
// appear here, and on /scouting/aggregates, without a manual reload.
// Routed via app/routes/scouting/events.tsx.
import { useState, type FormEvent } from 'react'
import { useGames, usePlayers, useScoutingEventsWithDetails } from '../../lib/scouting/hooks'
import { useCreateScoutingEvent } from '../../lib/scouting/mutation-hooks'

const EVENT_TYPES = ['goal', 'assist', 'hit', 'note']

export function EventsPage() {
  const players = usePlayers()
  const games = useGames()

  // feed filters (the brief: by player, by game, or both)
  const [filterPlayerId, setFilterPlayerId] = useState('')
  const [filterGameId, setFilterGameId] = useState('')
  const events = useScoutingEventsWithDetails({
    playerId: filterPlayerId || null,
    gameId: filterGameId || null,
  })

  // log-an-event form
  const createEvent = useCreateScoutingEvent()
  const [playerId, setPlayerId] = useState('')
  const [gameId, setGameId] = useState('')
  const [eventType, setEventType] = useState('goal')
  const [notes, setNotes] = useState('')

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createEvent.mutate(
      {
        player_id: playerId,
        game_id: gameId,
        event_type: eventType,
        notes: notes.trim() || null,
      },
      // keep player/game selected so a scout can log several events in a row
      { onSuccess: () => setNotes('') },
    )
  }

  const noPlayersOrGames =
    !players.isLoading && !games.isLoading &&
    ((players.data?.length ?? 0) === 0 || (games.data?.length ?? 0) === 0)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Scouting: events</h1>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 rounded-md border border-slate-200 p-4 text-sm"
      >
        <h2 className="font-semibold text-slate-900">Log an event</h2>
        {players.isError || games.isError ? (
          <p role="alert" className="text-rose-700">
            Could not load players or games for the form.
          </p>
        ) : noPlayersOrGames ? (
          <p className="text-slate-600">
            Add at least one player and one game first.
          </p>
        ) : null}
        <label className="grid gap-1">
          Player
          <select
            required
            className="rounded border border-slate-300 px-2 py-1"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          >
            <option value="">Choose a player</option>
            {players.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Game
          <select
            required
            className="rounded border border-slate-300 px-2 py-1"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">Choose a game</option>
            {games.data?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.played_on} vs {g.opponent}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Type
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Notes (optional)
          <input
            className="rounded border border-slate-300 px-2 py-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createEvent.isPending}
            className="rounded bg-sky-700 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {createEvent.isPending ? 'Saving…' : 'Log event'}
          </button>
          {createEvent.isError ? (
            <p role="alert" className="text-rose-700">
              Save failed: {createEvent.error.message}
            </p>
          ) : createEvent.isSuccess ? (
            <p className="text-emerald-700">Event saved.</p>
          ) : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          Player
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={filterPlayerId}
            onChange={(e) => setFilterPlayerId(e.target.value)}
          >
            <option value="">All</option>
            {players.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Game
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={filterGameId}
            onChange={(e) => setFilterGameId(e.target.value)}
          >
            <option value="">All</option>
            {games.data?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.played_on} vs {g.opponent}
              </option>
            ))}
          </select>
        </label>
      </div>

      {events.isPending ? (
        <p className="mt-4 text-sm text-slate-600">Loading events…</p>
      ) : events.isError ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          Could not load events: {events.error.message}
        </p>
      ) : events.data.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No events match these filters.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
          {events.data.map((event) => (
            <li key={event.id} className="px-4 py-3 text-sm">
              <span className="font-medium text-slate-900">
                {event.event_type} — {event.player.full_name}
              </span>
              <span className="text-slate-600">
                {' '}
                ({event.game.played_on} vs {event.game.opponent})
              </span>
              {event.notes ? (
                <p className="mt-1 text-slate-600">{event.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
