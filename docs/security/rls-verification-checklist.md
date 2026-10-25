# RLS and session verification checklist (hockey staff)

**Who this is for:** a beginner tester. You do not need to read SQL.
**Source of truth:** `docs/security/rls-policy-spec.md` and `supabase/migrations/20250321000000_hockey_staff_rls.sql`.
**Goal:** prove each role only gets the rows the spec allows, and that a signed-out visitor gets nothing, on the **server and API path** and not just on screen.

> **UI hiding is not enough.** A hidden menu or button proves nothing. Every "pass" below must hold when the data is requested directly (the server function, or the data API with that user's login). If a screen looks right but a direct request returns the data, that is a **fail**.

## Status at handoff (read this first)

| Area | Status | Evidence |
| --- | --- | --- |
| `requireSession` unit tests (Part E) | **Done: pass** | 10 Vitest tests, run with `npx vitest run src/lib/auth/require-session.test.ts`. Deliberately breaking the helper made them fail. |
| Server path review (E1) | **Done: pass** | `src/server/scouting-notes.ts` calls `requireSession()` before any query and uses the user-scoped server client. |
| Policy behavior (Parts A to D) on a stand-in database | **Done in simulation only** | An in-memory Postgres run of the migration with simulated roles passed 72 of 72 checks. The test scripts are not saved in the repo. This is **not** a substitute for the real checks below. |
| Policy behavior on the real Supabase project (Parts A to D) | **Blocked** | The migration is **not applied** to the live project, and no real coaching, scouting, or medical users exist yet. |
| Browser flow with real sign-in | **Blocked** | Needs the real anon key in `.env.local` and real test users. |

Do not report Sprint 4 as verified until Parts A to D have been walked on the real project.

## Before you start (needed for Parts A to D)

- [ ] The migration is applied to the Supabase project you are testing, and nothing else (the Sprint 3 pages will show empty results afterward; that is expected).
- [ ] Three test users exist in Supabase Auth, each with a row in `staff_profiles`: one `coaching`, one `scouting`, one `medical`. At least one scouting note and one sports-science row exist (added in the SQL editor).
- [ ] The app runs locally (`npm run dev`) with the real public URL and anon key in `.env.local`.
- [ ] You know how to sign out fully between roles (use the Sign out button on `/login`, then confirm `/scouting` asks you to sign in).
- [ ] You can send a direct request: either open `/scouting` and watch what the server returns, or use the Supabase dashboard's API/SQL tools as that user.

## A. Signed-out visitor

| Step | Action | Pass looks like | Fail looks like |
| --- | --- | --- | --- |
| A1 | With no session, open `/scouting`. | A "Sign in" prompt. No note text, no player names. | Any note text, or a normal list page. |
| A2 | With no session, request the notes directly with only the public key (the data API, not the app). | Permission denied or an empty result. | Any rows returned. |
| A3 | Sign in, then sign out, then reload `/scouting`. | Sign-in prompt again. | Notes still visible after sign-out. |
| A4 | Open `/scouting?role=scouting` while signed out. | Same sign-in prompt. The URL changes nothing. | Notes appear. |

Result: ☐ Pass ☐ Fail ☐ Blocked. Notes: ________

## B. Scouting staff

| Step | Action | Pass looks like | Fail looks like |
| --- | --- | --- | --- |
| B1 | Sign in as scouting. Open `/scouting`. | All scouting notes appear, with player names. | Empty when notes exist, or an error. |
| B2 | As scouting, try to read the sports-science table (SQL editor "run as user", or the data API with this user's login). | Zero rows or permission denied. | Any sports-science row. |
| B3 | As scouting, try to read the practice-plans table. | Zero rows or permission denied. | Any plan row. |
| B4 | As scouting, try to change a staff profile or role. | Denied. | The change succeeds. |

Result: ☐ Pass ☐ Fail ☐ Blocked. Notes: ________

## C. Coaching staff

| Step | Action | Pass looks like | Fail looks like |
| --- | --- | --- | --- |
| C1 | Sign in as coaching. Open `/scouting`. | "No scouting notes visible for your account." No note text. | Any scouting note. |
| C2 | As coaching, read scouting events directly (data API with this user's login). | Zero rows. | Any event row. |
| C3 | As coaching, read the sports-science table. | Zero rows or permission denied. | Any row. |
| C4 | As coaching, read the practice-plans table. | Plans appear. | Empty when plans exist. |
| C5 | As coaching, insert a scouting event. | Denied. | The insert succeeds. |

Result: ☐ Pass ☐ Fail ☐ Blocked. Notes: ________

## D. Medical staff

| Step | Action | Pass looks like | Fail looks like |
| --- | --- | --- | --- |
| D1 | Sign in as medical. Open `/scouting`. | "No scouting notes visible for your account." No note text. | Any scouting note. |
| D2 | As medical, read scouting events and scouting notes directly. | Zero rows. | Any row. |
| D3 | As medical, read the sports-science table. | Sports-science rows appear. | Empty when rows exist. |
| D4 | As medical, read the games table. | Zero rows (the matrix gives medical roster facts only). | Game rows appear. |
| D5 | As medical, read the practice-plans table. | Zero rows or permission denied. | Any plan row. |

Result: ☐ Pass ☐ Fail ☐ Blocked. Notes: ________

## E. Session gate and server path

| Step | Action | Pass looks like | Fail looks like |
| --- | --- | --- | --- |
| E1 | Read `src/server/scouting-notes.ts`. | `requireSession()` runs before any query. The client comes from `src/lib/supabase/server.ts`. No role is accepted from the browser. | A query before the session check, or a browser client. |
| E2 | Run `npx vitest run src/lib/auth/require-session.test.ts`. | 10 of 10 pass: success returns only id and email; no session, bad token, and Auth outage all throw. | A failing test, or only a happy-path test. |
| E3 | Search the built browser files (`.output/public`) for `player_scouting_notes` and `SERVICE_ROLE`. | No matches. | Either appears. |

Result: ☐ Pass ☐ Fail. Notes: ________

## Edge cases worth one extra look

- [ ] A signed-in user **with no `staff_profiles` row** sees no private rows anywhere.
- [ ] A user cannot give themselves a role by sending one from the browser.
- [ ] Revoking a user's session in Supabase makes `/scouting` ask for sign-in again, even if the browser still has the cookie.

## If something fails: which layer to fix

| Symptom | Likely layer | Where to look |
| --- | --- | --- |
| Signed-out visitor sees data | Session gate or policy missing | `require-session.ts`, `scouting-notes.ts`; confirm the migration is applied and anon has no table access |
| Right role sees nothing | Policy too narrow, or no `staff_profiles` row | The migration's SELECT policy for that table; the user's profile row |
| Wrong role sees rows | Policy too broad | The migration policy; check for a leftover permissive policy |
| Page looks right but a direct request leaks | Enforcement only in the UI | Move the rule into the database policy |
| Sign-in works but server says unauthorized | Cookie or client wiring | `src/lib/supabase/server.ts`, the browser client in `client.ts` |

Fix loop: name the failing row, quote the expected result from `rls-policy-spec.md`, fix that layer, then re-run only the failed rows and the unit tests.

## Sign-off

- Tester: ________  Date: ________
- Vitest `require-session`: ☐ Pass ☐ Fail
- Parts A to D on the real project: ☐ Pass ☐ Fail ☐ Blocked (list why)
- Overall: ☐ Pass ☐ Partial ☐ Fail
