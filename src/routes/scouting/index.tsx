// src/routes/scouting/index.tsx — Sprint 4 scouting notes page (/scouting).
//
// Shows ONLY what the server function returns. No Supabase client here, no
// role check, no filtering: which rows appear is decided by Postgres row-level
// security for the signed-in user. Routed via app/routes/scouting/index.tsx.
import { Link, getRouteApi } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

const route = getRouteApi('/scouting/')

export function ScoutingNotesPage() {
  const notes = route.useLoaderData()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Scouting notes</h1>
      <p className="mt-1 text-sm">
        The database decides which notes your account can see, not this page.
      </p>
      {notes.length === 0 ? (
        <p className="mt-6">No scouting notes visible for your account.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded border p-3">
              <div className="font-medium">{n.player_name}</div>
              <p className="text-sm">{n.note}</p>
              <p className="mt-1 text-xs">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export function ScoutingNotesError({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : ''
  const signedOut = message.startsWith('Unauthorized')
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Scouting notes</h1>
      {signedOut ? (
        <p className="mt-6" role="alert">
          Sign in to see scouting notes. <Link to="/login" className="underline">Go to sign-in</Link>
        </p>
      ) : (
        <p className="mt-6" role="alert">
          Could not load scouting notes. Try again.
        </p>
      )}
    </main>
  )
}
