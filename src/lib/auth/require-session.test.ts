// src/lib/auth/require-session.test.ts
//
// Proves requireSession() fails CLOSED: it returns an identity only when Supabase
// Auth confirms a real user, and it throws in every other case, so a protected
// server function can never reach its query without a verified caller.
//
// No network and no database: the server Supabase client is replaced by a fake.
// Supabase Auth's real answers (session missing, bad token, outage) are imitated
// with the same error shapes the real library returns.

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

import { createSupabaseServerClient } from '../supabase/server'
import { UnauthorizedError, requireSession } from './require-session'

const getUser = vi.fn()
const getSession = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createSupabaseServerClient).mockReturnValue({
    auth: { getUser, getSession },
  } as never)
})

describe('requireSession: verified caller', () => {
  it('returns only id and email when Supabase Auth confirms the user', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'staff-uuid-1',
          email: 'scout@example.com',
          app_metadata: { role: 'medical' }, // must NOT leak through
          user_metadata: { secret: 'x' },
        },
      },
      error: null,
    })

    const user = await requireSession()

    expect(user).toEqual({ id: 'staff-uuid-1', email: 'scout@example.com' })
  })

  it('asks Supabase Auth to validate the token (getUser), never just reads the cookie (getSession)', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.c' } }, error: null })

    await requireSession()

    expect(getUser).toHaveBeenCalledTimes(1)
    expect(getSession).not.toHaveBeenCalled()
  })

  it('takes no input, so a caller cannot pass in who they claim to be', () => {
    expect(requireSession.length).toBe(0)
  })
})

describe('requireSession: not signed in -> UnauthorizedError', () => {
  it('rejects when there is no session cookie (AuthSessionMissingError)', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthSessionMissingError', message: 'Auth session missing!', status: 400 },
    })

    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError)
    await expect(requireSession()).rejects.toThrow('Unauthorized: sign in required')
  })

  it('rejects a forged, expired, or revoked token (Auth answers 401)', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthApiError', message: 'invalid JWT', status: 401 },
    })

    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects a 403 from Auth the same way', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthApiError', message: 'forbidden', status: 403 },
    })

    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects when Auth reports no error but also no user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('never returns an identity when Auth reports an error, even if a user object is present', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.c' } },
      error: { name: 'AuthApiError', message: 'invalid JWT', status: 401 },
    })

    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError)
  })
})

describe('requireSession: Auth unavailable -> fail closed, not open', () => {
  it('denies with a neutral message when Auth returns a server error', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthRetryableFetchError', message: 'upstream detail', status: 503 },
    })

    const attempt = requireSession()
    await expect(attempt).rejects.toThrow('Session check failed')
    await expect(attempt).rejects.not.toBeInstanceOf(UnauthorizedError)
    await expect(requireSession()).rejects.not.toThrow(/upstream detail/)
  })

  it('denies when the Auth call itself throws (network down)', async () => {
    getUser.mockRejectedValue(new Error('ECONNREFUSED 10.0.0.5:443'))

    await expect(requireSession()).rejects.toThrow('Session check failed')
    await expect(requireSession()).rejects.not.toThrow(/ECONNREFUSED/)
  })
})
