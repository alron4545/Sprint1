// The only module allowed to construct a Supabase client with the
// service-role key.
//
// The `.server.ts` filename gives this file TanStack Start's import
// protection (see the execution-model guidance): importing it from
// client-rendered code — anything under src/routes/** or
// src/components/** — is denied at build time in production and gets a
// throwing mock proxy in dev. That's what turns the boundary
// docs/server-function-contract.md and /tmp/boundary-risk-notes.md ask
// for from "a rule someone has to remember" into something the framework
// enforces. Per the same guidance: this file has no client-side API at
// all, so a filename marker is the right tool here, not a per-function
// createServerOnlyFn wrapper.
//
// Only src/server/directoryLoader.ts's server-function handlers should
// import this — and only from inside a handler body, never at module
// scope in a file that's also imported by client code.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

function readServerEnv(): { url: string; serviceRoleKey: string } {
  // Read inside a function, not at module scope: a module-level read can
  // evaluate to `undefined` on request-scoped/edge runtimes, and reading
  // eagerly is exactly what makes a value easiest to accidentally inline
  // into a bundle.
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    // This can only ever be a local/deploy configuration problem, never
    // something a caller needs (or is allowed) to see. Callers must map
    // this to the contract's generic 'unavailable' failure reason —
    // never let this message itself reach a response.
    throw new Error(
      'Supabase server credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).',
    )
  }

  return { url, serviceRoleKey }
}

/**
 * Returns a singleton Supabase client authenticated with the
 * service-role key. Server-only — see the file banner above.
 */
export function getServerSupabaseClient(): SupabaseClient {
  if (!client) {
    const { url, serviceRoleKey } = readServerEnv()
    client = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return client
}
