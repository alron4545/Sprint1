// src/lib/supabase/server.ts
//
// SERVER Supabase client for TanStack Start server functions.
//
// DO NOT import this file from route components, components, or any code that
// renders in the browser. It reads and writes the signed-in user's session
// cookies, which only exist on the server.
//
// What it is: the public anon key plus the caller's session cookie, so every
// query runs AS THE SIGNED-IN USER and Postgres row-level security can apply
// (docs/security/auth-session-plan.md, steps 3-4).
//
// What it is NOT: it never uses the service-role key. That key skips RLS and
// lives only in app/lib/supabase.server.ts for non-role-bound jobs. Do not use
// it for scouting or medical rows.
//
// This file only BUILDS the client. The "require a valid session" check is a
// separate helper added in a later step, and every sensitive server function
// must call it before any query.

import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { publicEnv } from '#/config/env'
import type { Database } from '../../types/database'

/**
 * Create a Supabase client bound to the current request's cookies.
 * Call it inside a server function, once per request. Do not cache it at module
 * level: that would share one user's session with the next caller.
 */
export function createSupabaseServerClient() {
  return createServerClient<Database>(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options)
        }
      },
    },
  })
}
