# Auth Session Plan — Hockey Staff (Sprint 4)

**Status:** plan only. No login code, no SQL, no package installs in this step.
**Reader:** a beginner stakeholder or a coding agent who has not seen the earlier steps.

## Purpose

This plan says how staff prove who they are with Supabase Auth, where their login session lives, and how TanStack Start server functions must check identity again before any private query.

It answers one question: **how do we know who is asking?**
What each person may see is a different question. That is answered in `docs/security/role-access-matrix.md`, and the matrix is the source of truth for it.

## Roles in scope (from the matrix)

- coaching
- scouting
- medical

No other roles are added here. Open matrix question 1 (how a user is assigned a role) is still unanswered, and this plan depends on it. See "Open questions".

## Where the project stands today

- The scouting pages read and write data straight from the **browser** with the public (anon) key. There is no sign-in and no server check.
- A server-only Supabase client exists (`app/lib/supabase.server.ts`). It uses the **service-role** key, which **bypasses row-level security**. Today it serves only the player directory, which is not private data.
- The Supabase packages for reading sessions from cookies on the server are **not installed yet**.

Each of these changes later in Sprint 4. This plan says how.

## End-to-end sequence

1. **Login.** A staff member opens a login page and signs in with Supabase Auth (email and password). Supabase checks the credentials and creates a session.
2. **Session storage.** The session is kept in cookies, managed by Supabase's cookie helpers for server-rendered apps. The cookie travels with every later request. No long-lived secret is pasted into front-end code.
3. **Server verify.** Before any private query, a TanStack Start server function builds a **server Supabase client**, reads the session from the request, and runs a **require-session** helper. If there is no valid session, it stops and returns an "unauthorized" error. It never queries the private tables.
4. **Data access.** Only after step 3 passes does the function query data. The query runs **as the signed-in user**, so Postgres row-level security (RLS) can filter rows per role later. The screen is never the only gate.

```text
Staff browser          TanStack Start server       Supabase Auth / Postgres
     |                        |                            |
     |-- sign in ------------>|--- auth API -------------->|
     |<-- session cookie -----|<-- session created --------|
     |                        |                            |
     |-- load scouting ------>| server function            |
     |                        |-- require-session -------->| (is this cookie a real, live session?)
     |                        |-- query as that user ----->|
     |<-- allowed rows only --|<-- rows (RLS, later) ------|
```

## Browser client versus server client

| Client | Where it runs | Used for | Never used for |
| --- | --- | --- | --- |
| Browser client (public anon key) | The user's browser | Starting sign-in and sign-out | Deciding who may see private data |
| Server client (anon key plus the user's session cookie) | Inside server functions | Reading the session, then querying **as that user** so RLS applies | Anything before the session check passes |

**Why server functions must not trust the browser alone.** The browser is outside our control. A teammate or attacker can call a server function directly, with no menu and no React state. The only thing the server can trust is a session it verifies itself.

**The service-role client is not the server client for private data.** It skips RLS, so using it for scouting or medical rows would make every future RLS rule pointless. It stays for server-only jobs that are not role-bound, and it is never given to the browser. This is a hard rule for Sprint 4.

## Session rules (non-negotiable)

- A login page that set some React state is **not** proof of identity on the server.
- Every sensitive server function checks the session itself, every time.
- A missing, expired, or unverifiable session means **deny**. No partial private rows.
- If the session check itself fails (for example Supabase Auth is unreachable), the function returns an error. It never skips the check.
- Role names must match the matrix exactly: coaching, scouting, medical.
- Never write the service-role key, a database password, or a session token into docs, commits, logs, or chat.

## Server functions that must call require-session (planned)

| Server entry (planned name) | Why |
| --- | --- |
| `get-current-staff` (or equivalent) | Resolves who is signed in and which role they hold, so the app can show role-specific screens |
| Scouting data loader (reads) | Returns scouting rows only after identity is verified. RLS filters further later |
| Scouting data writers (log an event, save player notes) | Writes are covered by the rules too (brief rule 6) |
| Any future sports-science or medical loader | Same pattern: session first, then query |

Sign-in and sign-out helpers establish or clear the session. They are not data loaders, but they must use the correct client for where they run.

**Migration note.** Today's scouting pages call the data helpers from the browser. For private data, those calls move behind server functions that run the session check first. The existing helpers can be reused inside the server functions.

## What this plan deliberately defers

- The client file layout and new packages (next implementation step).
- The login route and sign-in and sign-out modules.
- The actual `require-session` helper code.
- RLS policy SQL. RLS will enforce per-role rows in Postgres, after the authorization concept step.
- Turning RLS on. It is off today, so until it is on, a valid session does **not** by itself limit which rows a signed-in user gets.

## Open questions

1. **Role assignment** (matrix open question 1). Where does a signed-in user's role come from: a staff profile table, a claim in the session, or an invite table? RLS and `get-current-staff` both depend on it.
2. **Session lifetime.** How long should a staff session last on a shared tablet or workstation, and what happens when it expires mid-task?
3. **Sign-up.** Can anyone create an account, or only invited staff? Open sign-up would let outsiders get a valid session.
4. **Password reset and email confirmation.** Required for version 1, or later?

## Acceptance checks for later agent work

- [ ] Browser and server clients are separate files, used in the right place.
- [ ] Login creates a real Supabase Auth session, not fake local state.
- [ ] Every sensitive server function calls require-session before any query.
- [ ] Unauthenticated calls fail closed, with no private rows.
- [ ] The server client for private data uses the user's session, **not** the service-role key.
- [ ] A direct call to a server function with no cookie is refused (test it, not just the screen).
- [ ] Role names match `docs/security/role-access-matrix.md`.
- [ ] No secret keys or tokens appear in code, docs, or commits.

## Source links

- Access brief: `docs/security/hockey-staff-access-brief.md`
- Role matrix: `docs/security/role-access-matrix.md`
- Client versus server inventory: `docs/client-vs-server-inventory.md`
