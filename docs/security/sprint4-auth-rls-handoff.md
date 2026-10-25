# Sprint 4 Handoff: Auth Sessions and Row-Level Security

**Project:** Hockey operations app (scouting notes and sports-science data)
**Sprint:** Sprint 4, identity: who you are and what you may do
**Audience:** hockey ops leads, product owners, and the next engineer
**Sources:** `docs/security/hockey-staff-access-brief.md`, `docs/security/role-access-matrix.md`, `docs/security/auth-session-plan.md`, `docs/security/rls-policy-spec.md`, `docs/security/rls-verification-checklist.md`, `supabase/migrations/20250321000000_hockey_staff_rls.sql`

## Status in one paragraph (read this first)

The code, the database rules, and the tests for role-based access are **written and committed**. They have been checked against **stand-ins**: fake Supabase responses and an in-memory Postgres. They have **not** been applied to the live Supabase project, and they have **not** been tried with real coaching, scouting, and medical accounts. **Today, on the live database, row-level security is still off, so anyone holding the app's public key can read and change every row.** The sprint is a complete slice that is ready to apply, not a finished protection. Section 6 lists what must happen first.

## 1. Sprint outcome (client story)

Scouting notes and sports-science data must not be visible to every staff member. Coaching, scouting, and medical staff share tables but must see different rows, even if someone skips the normal screens and calls the data API directly.

This sprint built the pieces for that: sign-in with Supabase Auth, a sign-in check inside server functions (the browser alone is never trusted), and Postgres row-level security (RLS) rules for each role.

### Privacy goals, one by one

"Built" means the code or SQL exists in the repo. "Checked" means a test passed against a stand-in. "Live" means proven on the real Supabase project.

| Goal from the access brief | Status | Evidence |
| --- | --- | --- |
| Rule 1: coaching must not read scouting notes | Built and checked on a stand-in. **Not live.** | Policies in `supabase/migrations/20250321000000_hockey_staff_rls.sql` allow scouting only on `scouting_events` and `player_scouting_notes`. Stand-in run: coaching got zero rows. |
| Rule 2: scouting must not read sports-science or medical rows | Built and checked on a stand-in. **Not live.** | Same migration; `sports_science_records` allows medical only. The table holds placeholder columns and no real data. |
| Rule 3: medical must not read scouting notes | Built and checked on a stand-in. **Not live.** | Same migration. |
| Rule 4: signed-out visitors must not read or change any private row | **Partly.** The server path refuses signed-out callers. The database rules also deny them, but only once applied. | `src/lib/auth/require-session.ts` and its 10 tests; the migration removes signed-out table access. **Today's live database still allows it.** |
| Rule 5: shared directory facts may be visible to signed-in staff | Built and checked on a stand-in. Not live. | Roster visible to all three roles; games visible to coaching and scouting. Whether medical should see more is still open. |
| Rule 6: rules cover reads **and writes** | **Partly.** The database rules cover writes. The app's write screens were **not** rebuilt. | Insert and update policies exist. The Sprint 3 event and notes forms still write through the public browser key, so they will fail once the rules are applied. |
| Rule 7: rules hold on direct API calls, not only screens | Built and checked on a stand-in. **Not live.** | The rules sit on the tables. The simulated browser run showed no direct data requests from the page. |
| Success: a test plan checks each rule with a direct call | Written. **Not run on the real project.** | `docs/security/rls-verification-checklist.md` |
| Success: stakeholders approve before SQL is written | **Not done.** The SQL was written with open questions still unanswered (section 5). | `docs/security/role-access-matrix.md` open questions |

## 2. What was delivered

**Sign-in and sign-out**
- Login page at `/login` (`src/routes/login.tsx`), with `src/lib/auth/sign-in.ts` and `src/lib/auth/sign-out.ts`.
- Two Supabase clients: browser (`src/lib/supabase/client.ts`, public key only, session kept in cookies) and server (`src/lib/supabase/server.ts`, public key plus the caller's session, never the service-role key).
- Env names are in `.env.example`.

**Server-side session check**
- `src/lib/auth/require-session.ts` asks Supabase Auth to validate the caller's session every time. If there is no valid session, or Auth cannot be reached, it refuses. It takes no input from the browser.
- `src/server/get-current-staff.ts` returns only the signed-in person's id and email. It does **not** return a role yet.
- `src/server/scouting-notes.ts` and the `/scouting` page: the notes load only through the server, after the session check, as the signed-in user, so the database decides the rows.

**Row-level rules by role** (`supabase/migrations/20250321000000_hockey_staff_rls.sql`)
- RLS is enabled and forced on `staff_profiles`, `players`, `games`, `scouting_events`, `player_scouting_notes`, `sports_science_records`, and `practice_game_plans`.
- A helper, `current_staff_role()`, looks up the caller's role in `staff_profiles`. The role never comes from the browser.
- Coaching reads roster, games, and plans. Scouting reads roster and games and reads and writes scouting events and notes. Medical reads roster and reads and writes sports-science records. Nobody can delete.
- Scouting note text moves off the shared roster table into `player_scouting_notes`, and the migration drops `players.notes`.

**Verification**
- `src/lib/auth/require-session.test.ts`: 10 automated tests.
- `docs/security/rls-verification-checklist.md`: the manual role-by-role walk.

## 3. How to assign coaching, scouting, and medical roles

There is **no admin screen** for this. Today it is a manual, privileged step:

1. Create the staff member in Supabase: Authentication, Users.
2. In the Supabase SQL editor, add a row to `staff_profiles` with that user's id and one role: `coaching`, `scouting`, or `medical`. An example is in the header of the migration file.
3. Have the person sign in at `/login`.
4. Re-run the matching rows of the verification checklist.

A signed-in user **without** a profile row sees no private rows. That is intentional. Users cannot change their own role: the database refuses.

**Not built, so do not promise it:** an admin screen for role changes, invites, HR sync, people with two roles, or temporary elevated access.

**Recommended, not done:** turn off public self-sign-up in the Supabase dashboard so only invited staff can create accounts. Signing up gives a session but no role, so no private data, but it still lets strangers create accounts.

## 4. How to run the verification checklist

1. Apply the migration to a **test** project first (see section 6).
2. Create three test users and add their `staff_profiles` rows.
3. Run `npx vitest run src/lib/auth/require-session.test.ts`.
4. Walk `docs/security/rls-verification-checklist.md`, parts A to E.
5. Record pass, fail, or blocked, with a date.

If anything fails, do **not** fix it by hiding a button. A screen that looks right but returns data on a direct request is a fail. Trace the session check and the database rule.

**Where the checklist stands now:** the unit tests and the server-path review pass. Parts A to D on the real project are **blocked**: no migration applied and no real test users.

## 5. Residual risks and open questions

| Risk | Why it matters | What to do |
| --- | --- | --- |
| **RLS is off on the live database** | Anyone with the public key can read and change everything. | Apply the migration after the app changes in section 6. |
| Sprint 3 pages and forms break when the rules are applied | `/scouting/players`, `/events`, and `/aggregates` read through the public browser key. Logging events and saving notes write the same way. | Move them behind signed-in server functions first. |
| `players.notes` is dropped by the migration | `updatePlayerNotes` and the generated types still expect it. The types for `player_scouting_notes` were **added by hand**. | Update the notes code. After applying, regenerate types (`docs/typegen-notes.md`). |
| Role assignment is manual and unaudited | A wrong role gives wrong access. | Admin tooling in the next topic; re-run the checklist after any change. |
| Service-role key | It skips the rules. `app/lib/supabase.server.ts` uses it for the player directory. | Keep it server-only and out of role-bound data paths. |
| The sports-science and plans tables are placeholders | Column designs are guesses. | Stakeholders define them. |
| Tests use fakes | They prove our logic, not Supabase's behavior. | The real-project checklist run. |
| Vercel production returned 404 earlier | Not diagnosed. | Check the deployment and its env vars. |
| Open decisions in the matrix | Scouts see all notes or only their own; medical sees all athletes or a caseload; dual roles; who edits roster and games; whether coaching needs event totals; delete. | Stakeholder answers. Current policies take the narrow reading. |

## 6. Before this is safe to rely on

1. Get stakeholder answers on the open decisions above, or accept the narrow defaults.
2. Move the Sprint 3 reads and writes behind signed-in server functions, and point the notes code at `player_scouting_notes`.
3. Apply the migration to a test project, regenerate the types, and create test users.
4. Walk the checklist and fix any failure.
5. Apply to the live project, and add real staff profiles.
6. Turn off public sign-up. Confirm the Vercel deployment and its env vars.

## 7. What rolls into the next topic

1. **Admin role assignment:** a controlled way to set roles without raw SQL.
2. **Playwright role journeys:** scripted sign-in as each role, asserting allowed and denied views.
3. **CI and Vercel safeguards:** run the unit tests and role journeys on every change, and keep secret keys out of preview and production builds.
4. **Remaining app work:** server paths for the other scouting screens and for writes, plus the sports-science and plans features.

## 8. Decision log

1. **Identity is checked on the server**, by asking Supabase Auth each time (`getUser`), not only by reading the cookie. A copied or revoked token is refused.
2. **Row visibility lives in Postgres RLS.** App code has no second copy of the role rule.
3. **Roles come from a `staff_profiles` table** that users cannot write. Provisional until stakeholders confirm.
4. **Scouting note text moved to its own table**, because row-level rules cannot hide one column of a shared row.
5. **Minimal placeholder tables** for sports-science and plans, so their rules exist and can be tested.
6. **Deny by default:** no delete anywhere, no roster or game edits for anyone, and signed-out users have no table access.
7. **Types were hand-added** for the new table because the migration is not applied yet.
8. **Nothing was applied to the live project**, because it would break the Sprint 3 pages.

## 9. Sign-off

- [ ] Privacy goals mapped above (built, checked, live, or deferred)
- [ ] Role assignment steps match how profiles and RLS work
- [ ] Verification checklist run on the real project: pass, fail, or blocked
- [ ] Residual risks and next-topic items reviewed with stakeholders

**Sprint status:** code, rules, and tests complete and committed; **not applied or verified on the live project.**
