# RLS Policy Specification — Hockey Staff Data

**Source of truth for who may do what:** `docs/security/role-access-matrix.md` (the matrix wins if this file disagrees).
**Identity source:** `docs/security/auth-session-plan.md`.
**Status:** draft for stakeholder review. Plain-language intent only. No finished SQL. The next step turns this into a migration.

## Purpose

Coaching, scouting, and medical staff share tables but must see different rows. This document says, per table, per role, and per operation, what the database must allow and what it must block. The database enforces it, so hiding a button or checking only in a server function is never the only protection.

## Identity linkage

- **Who is asking:** the signed-in Supabase Auth user. In the database this is `auth.uid()`. The server runs queries as that user (`src/lib/supabase/server.ts`), so the policies see the same person `requireSession()` verified.
- **What role they hold:** a new table, `staff_profiles`, with one row per staff member: `user_id` (the Auth user) and `role` (one of `coaching`, `scouting`, `medical`). Policies look up the current user's role from the row where `user_id = auth.uid()`.
- **This resolves matrix open question 1 provisionally.** Stakeholders must confirm it before the migration is applied.
- **Role is never read from anything the browser sends.** No client-supplied claim, header, or flag is trusted.
- **`staff_profiles` itself is protected.** A signed-in user may read only their own profile row. No app user may insert, update, or delete profiles, because otherwise anyone could give themselves the medical role. Roles are assigned by an administrator outside the app's normal user path (the service-role key stays out of the app; see cross-cutting rule 4).
- **No profile means no access.** A signed-in user with no `staff_profiles` row sees no private rows.
- **Signed-out visitors (the anon role):** no access to any table in this document.
- **Single role per person for version 1.** Dual roles are matrix open question 4. Until decided, one profile row holds one role.

## Tables in scope

| Table | Exists today? | Sensitivity | Role access (matrix) |
| --- | --- | --- | --- |
| `staff_profiles` | No — new | High (controls everyone's access) | Own row read only |
| `players` (roster fields) | Yes | Low — directory facts | All three roles read |
| `games` | Yes | Low | Coaching and scouting read |
| `scouting_events` (includes its `notes`) | Yes | High — competitive intel | Scouting read and write |
| Player scouting notes | **Not safe as built** — see "Blocking decision" | High | Scouting read and write |
| Sports-science / medical records | No — name to be decided (working name `sports_science_records`) | High | Medical read and write |
| Practice and game plans | No — name to be decided | Medium | Coaching read and write |

## Blocking decision: `players.notes` sits on the shared roster table

Row-level security decides which **rows** a role gets, not which **column** of a row. Today `players.notes` holds scouting-note text on the same table every role must read for the roster. If it stays there, coaching and medical staff can read scouting notes whenever they read a player. That breaks matrix rules 1 and 3.

**Required before the policies are applied:** scouting note text must live somewhere other than the shared roster rows. Recommended: move it to its own table (working name `player_scouting_notes`, one note per player or per entry), governed by the same rules as `scouting_events`. The alternative is column-level privileges, which are harder to review. Stakeholders or the instructor must choose (matrix open question 9). The rest of this spec assumes the separate-table option.

## Policy intents by table

All tables below have row-level security **enabled and forced**. Anything not listed as allowed is denied.

### `staff_profiles`

| Operation | coaching / scouting / medical | Intent |
| --- | --- | --- |
| SELECT | Own row only | Visible when the row's `user_id` is the current user |
| INSERT | **Deny** | No app user creates profiles |
| UPDATE | **Deny** | No app user changes a role |
| DELETE | **Deny** | No app user removes profiles |

### `players` (roster fields: name, position, team, jersey number)

| Operation | coaching | scouting | medical | Intent |
| --- | --- | --- | --- | --- |
| SELECT | Allow | Allow | Allow | Any signed-in user with a valid staff profile sees roster rows. Contains no note text (see blocking decision). |
| INSERT | **Deny** | **Deny** | **Deny** | Who may edit the roster is undecided (matrix open question 6) |
| UPDATE | **Deny** | **Deny** | **Deny** | Same |
| DELETE | **Deny** | **Deny** | **Deny** | Same |

### `games`

| Operation | coaching | scouting | medical | Intent |
| --- | --- | --- | --- | --- |
| SELECT | Allow | Allow | **Deny** | Medical gets roster facts only (matrix) |
| INSERT / UPDATE / DELETE | **Deny** | **Deny** | **Deny** | Who may edit games is undecided (open question 6) |

### `scouting_events` and `player_scouting_notes` (same rules for both)

"Same tables, different rows": scouting staff get the rows; everyone else gets none.

| Operation | coaching | scouting | medical | Intent |
| --- | --- | --- | --- | --- |
| SELECT | **Deny** | Allow | **Deny** | USING: the current user's role is `scouting`. Scouts see all scouting rows until open question 2 (own rows only?) is decided. |
| INSERT | **Deny** | Allow | **Deny** | WITH CHECK: the current user's role is `scouting`, and the row points at an existing player and game |
| UPDATE | **Deny** | Allow | **Deny** | USING and WITH CHECK both require the `scouting` role, so an update cannot hand a row to a different context |
| DELETE | **Deny** | **Deny** | **Deny** | The matrix grants "write" as create and update. Delete is undecided, so it is denied. |

### Sports-science / medical records (table not created yet)

| Operation | coaching | scouting | medical | Intent |
| --- | --- | --- | --- | --- |
| SELECT | **Deny** | **Deny** | Allow | USING: the current user's role is `medical`. Whether medical sees all athletes or only an assigned caseload is open question 3. |
| INSERT | **Deny** | **Deny** | Allow | WITH CHECK: role is `medical` |
| UPDATE | **Deny** | **Deny** | Allow | USING and WITH CHECK: role is `medical` |
| DELETE | **Deny** | **Deny** | **Deny** | Undecided, so denied |

### Practice and game plans (table not created yet)

| Operation | coaching | scouting | medical | Intent |
| --- | --- | --- | --- | --- |
| SELECT | Allow | **Deny** | **Deny** | USING: role is `coaching` |
| INSERT | Allow | **Deny** | **Deny** | WITH CHECK: role is `coaching` |
| UPDATE | Allow | **Deny** | **Deny** | USING and WITH CHECK: role is `coaching` |
| DELETE | **Deny** | **Deny** | **Deny** | Undecided, so denied |

## Cross-cutting rules

1. **Database enforcement.** Hiding menus or checking in a server function is never the only protection. The same rule must hold for a direct API call.
2. **Default deny.** If a role and operation are not listed as allowed above, the migration adds no permissive policy for it.
3. **Reads and writes.** Every table needs a read rule, not only write rules. A write-only policy leaves the data readable by everyone.
4. **User-scoped client.** Server functions that touch these tables use the user-scoped server client so the policies apply. The service-role key bypasses row-level security and must not serve any role-bound table. It may only support administrator tasks such as assigning roles.
5. **The totals function stays user-scoped.** `player_event_counts` must keep running with the caller's permissions (security invoker) so it respects these policies. For coaching and medical it returns nothing, because they cannot read scouting events. Its execute permission for the anon role must be removed.
6. **Role lookup.** Policies resolve the role from `staff_profiles` through a small helper that cannot be bypassed or recursed. The helper reads only the row for `auth.uid()`.
7. **Existing pages will go empty.** The Sprint 3 scouting pages read through the anon browser client. Once policies are applied, anon sees nothing. The app must read through signed-in server functions **before** the migration reaches the live database, or the pages will show empty results.
8. **Open questions are not decisions.** Where the matrix is undecided, this spec uses the narrower reading, or deny.

## Traceability

| Matrix row | Table | Covered by |
| --- | --- | --- |
| player_roster_shared_fields | `players` | SELECT allow for all three; writes deny |
| game_facts | `games` | SELECT coaching and scouting; medical deny; writes deny |
| scouting_notes | `scouting_events`, `player_scouting_notes` | scouting R+W; coaching and medical deny; delete deny |
| medical_or_sports_science_data | sports-science table (planned) | medical R+W; coaching and scouting deny |
| practice_or_game_plans | plans table (planned) | coaching R+W; scouting and medical deny |
| Signed-out visitors: deny | all | no anon policies |
| Role assignment (open question 1) | `staff_profiles` | provisional design above |

## Open questions carried forward

1. Confirm the `staff_profiles` design, and who assigns roles (matrix Q1).
2. Do scouts see all scouting notes or only their own? An author column is needed for "own" (Q2).
3. Medical: all athletes or an assigned caseload? Where is the assignment stored? (Q3)
4. Can one person hold two roles? (Q4)
5. Who may create and edit roster and game rows? (Q6)
6. Does coaching need event totals from scouting events? Row-level rules cannot hide a column (Q7).
7. How are scouting notes separated from `players` (blocking decision above, Q9)?
8. Is delete ever allowed, and for whom?
9. What are the table names for the sports-science and plans data?

## Ready for migration when

- [ ] Every sensitive matrix data area maps to a table section above
- [ ] Every role has an explicit allow or deny for SELECT, INSERT, UPDATE, DELETE
- [ ] Identity linkage matches the auth session plan
- [ ] "Same tables, different rows" is stated for scouting and sports-science data
- [ ] The `players.notes` blocking decision has an answer
- [ ] No finished SQL is needed to understand the rules
