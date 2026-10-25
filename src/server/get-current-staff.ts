// src/server/get-current-staff.ts
//
// Server function: "who is signed in?" It only calls requireSession() and
// returns the two identity fields the auth plan allows. No input at all, so
// nothing the browser sends can claim an identity.
//
// Role (coaching / scouting / medical) is NOT returned yet: how a role is
// assigned is still an open question in docs/security/role-access-matrix.md.
// Role enforcement belongs to the RLS steps, not here.
//
// Every later protected loader (scouting notes, medical data) starts the same
// way: await requireSession(), then query.

import { createServerFn } from '@tanstack/react-start'
import { requireSession } from '../lib/auth/require-session'

export type CurrentStaff = {
  id: string
  email: string | undefined
}

export const getCurrentStaff = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentStaff> => {
    const user = await requireSession()
    return { id: user.id, email: user.email }
  },
)
