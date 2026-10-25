// src/lib/auth/require-session.ts
//
// SERVER-ONLY gate. Call it at the top of every server function that touches
// private data, BEFORE any query (docs/security/auth-session-plan.md, step 3).
//
// It takes no arguments on purpose. Who the caller is comes only from the
// session cookie on the request, checked against Supabase Auth. A user id or an
// "isLoggedIn" value sent by the browser is never an input and never proof.
//
// Why getUser() and not getSession(): getSession() only reads the cookie, so a
// copied, forged, expired, or revoked token can still look fine. getUser() asks
// Supabase Auth to validate the token each time, which is the real check.
//
// Fails closed: no session, an invalid session, or an unreachable Auth service
// all throw. The function never returns a user it could not verify.
//
// Authentication only: this says WHO is calling, not which rows they may see.
// Role rules are the matrix and RLS, in later steps.
//
// Do not import this file from browser or UI code.

import { createSupabaseServerClient } from '../supabase/server'

export type SessionUser = {
  id: string
  email: string | undefined
}

/** The caller has no valid, verified session. Safe to show: no details inside. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized: sign in required')
    this.name = 'UnauthorizedError'
  }
}

export async function requireSession(): Promise<SessionUser> {
  const supabase = createSupabaseServerClient()

  let result
  try {
    result = await supabase.auth.getUser()
  } catch {
    // Auth service unreachable or threw: deny, never skip the check.
    throw new Error('Session check failed')
  }

  const { data, error } = result

  if (error) {
    // No cookie, bad token, expired or revoked session: the caller is not signed in.
    const status = (error as { status?: number }).status
    if (error.name === 'AuthSessionMissingError' || status === 400 || status === 401 || status === 403) {
      throw new UnauthorizedError()
    }
    // Anything else (for example Auth is down): deny, with a neutral message.
    throw new Error('Session check failed')
  }

  if (!data.user) throw new UnauthorizedError()

  return { id: data.user.id, email: data.user.email }
}
