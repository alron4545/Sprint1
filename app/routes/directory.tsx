// Hockey Operations Directory page — Sprint 2 Topic 2.
//
// This route's only data source is listDirectoryEntries() from
// app/server/directory.ts, a createServerFn: the browser calls it like an
// ordinary async function, but its body (the Supabase query, the
// service-role client) runs on the server and never reaches the client
// bundle. This file must never import app/lib/supabase.server.ts or any
// secret/env helper directly — see docs/server-function-contract.md and
// docs/client-vs-server-inventory.md for why.
//
// listDirectoryEntries never throws — every outcome (validation failure,
// upstream failure, success) comes back as a ListDirectoryEntriesResult,
// so this route checks `result.ok` itself instead of relying on a thrown
// error to reach an errorComponent.
import { createFileRoute } from '@tanstack/react-router'
import { listDirectoryEntries } from '../server/directory'

export const Route = createFileRoute('/directory')({
  // Loader runs on the server for the initial request (SSR) and again on
  // the client for in-app navigation, same as the players/games loaders.
  loader: async () => listDirectoryEntries({ data: {} }),
  component: DirectoryPage,
})

function DirectoryPage() {
  const result = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Hockey Operations Directory
      </h1>
      <p className="mt-2 text-slate-600">
        Players and staff, loaded through the server-side directory
        function &mdash; the browser never talks to Supabase directly.
      </p>

      {!result.ok ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&rsquo;t load the directory right now: {result.error.message}
        </p>
      ) : result.entries.length === 0 ? (
        <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
          No directory entries found.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
          {result.entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium text-slate-900">
                {entry.displayName}
              </span>
              <span className="text-sm text-slate-600">
                {entry.role}
                {entry.teamName ? ` · ${entry.teamName}` : ''}
                {entry.positionOrTitle ? ` · ${entry.positionOrTitle}` : ''}
                {entry.jerseyNumber != null ? ` · #${entry.jerseyNumber}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
