// app/lib/supabase.server.ts
//
// Server-only Supabase client. Do NOT import this from app/routes/** or any
// component that renders in the browser — see docs/client-vs-server-inventory.md
// for why. Only server-side code (server functions, other .server.ts modules)
// may import this module.
//
// This client is authenticated with the SERVICE ROLE key on purpose: it
// bypasses Row Level Security, which is exactly why it must never leave the
// server. The browser only ever talks to a server function, never to this
// module directly.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverEnv } from '#/config/env'

let cachedClient: SupabaseClient | null = null

/**
 * Returns a Supabase client authenticated with the secret service-role key.
 * Call only from server functions / other server-only modules.
 *
 * `serverEnv.SUPABASE_URL` / `serverEnv.SUPABASE_SERVICE_ROLE_KEY` (from
 * app/config/env.ts) already throw a clear, specific error if either value
 * is missing — no need to duplicate that check here.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        // This client runs on the server, not in a browser tab — there is
        // no session to persist and no refresh-token flow to run.
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return cachedClient
}
