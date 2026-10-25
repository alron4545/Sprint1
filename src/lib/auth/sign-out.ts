// src/lib/auth/sign-out.ts
//
// Thin BROWSER helper: ends the Supabase Auth session and clears the session
// cookies. Same client as sign-in, so it clears exactly what sign-in created.

import { createSupabaseBrowserClient } from '../supabase/client'

export type SignOutResult = { ok: true } | { ok: false; message: string }

export async function signOut(): Promise<SignOutResult> {
  try {
    const { error } = await createSupabaseBrowserClient().auth.signOut()
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Could not reach the sign-in service. Try again.' }
  }
}
