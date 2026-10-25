// src/lib/supabase/client.ts
//
// Typed Supabase client for scouting READS. Uses only the public anon key
// (VITE_* vars are bundled into browser code on purpose), so it is safe in
// browser or server code. The service-role key must never be used here —
// that one lives only in app/lib/supabase.server.ts.
//
// Two exports:
//   supabase                      — the existing scouting READS client (kept as is
//                                   so current pages keep working).
//   createSupabaseBrowserClient() — the Sprint 4 BROWSER client for sign-in and
//                                   sign-out. It stores the session in cookies so
//                                   server functions can verify it
//                                   (docs/security/auth-session-plan.md, steps 1-2).
//                                   The browser must never be the only place that
//                                   decides who someone is.

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — add both to your local .env file (see .env.example).',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Browser Supabase client for the login UI (later step). Public settings only:
 * the project URL and the anon key. Never add a secret key here.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
