// src/routes/login.tsx — Sprint 4 staff sign-in page.
//
// Form -> signIn() helper -> navigate home on success. Shows the helper's
// message on failure. Includes a Sign out button for manual testing.
// No protected data is loaded here; session checks come in a later step.
// Routed via app/routes/login.tsx (this project's routes folder).
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { signIn } from '../lib/auth/sign-in'
import { signOut } from '../lib/auth/sign-out'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setNotice(null)
    const result = await signIn(email, password)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setPassword('')
    await navigate({ to: '/' })
  }

  async function onSignOut() {
    setPending(true)
    setError(null)
    setNotice(null)
    const result = await signOut()
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setNotice('Signed out.')
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Staff sign-in</h1>
      <p className="mt-2 text-sm">Hockey operations — use your staff email and password.</p>
      {/* method="post" on purpose: if the form is ever submitted before the page
          finishes loading, the browser must not put the password in the URL. */}
      <form method="post" onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            autoComplete="username"
            className="mt-1 w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="text-sm" role="status">
            {notice}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {pending ? 'Working…' : 'Sign in'}
        </button>
      </form>
      <button type="button" onClick={onSignOut} disabled={pending} className="mt-4 text-sm underline">
        Sign out
      </button>
    </main>
  )
}
