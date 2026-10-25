// src/lib/auth/sign-in.ts
//
// Thin BROWSER helper: email + password -> Supabase Auth session.
// Uses the cookie-based browser client (createSupabaseBrowserClient) so the
// session is stored in cookies the server can verify later
// (docs/security/auth-session-plan.md, steps 1-2). It never uses the server
// client or the service-role key.
//
// Returns { ok } instead of throwing, so the login screen can show a message.
// A successful sign-in only creates a session. It does NOT make any data safe
// to show: server functions must still verify the session themselves.

import { createSupabaseBrowserClient } from '../supabase/client'

export type SignInResult = { ok: true } | { ok: false; message: string }

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail || !password) {
    return { ok: false, message: 'Email and password are required.' }
  }

  try {
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Could not reach the sign-in service. Try again.' }
  }
}
