# Role Access Matrix — Hockey Staff (Sprint 4)

**Source brief:** `docs/security/hockey-staff-access-brief.md` (the brief wins if this file ever disagrees with it).
**Purpose:** the allow/deny contract for server-side session checks and, later, Postgres row-level security (RLS).
**Roles (columns):** coaching | scouting | medical. Only these three. Other job titles map into one of them (for example "head coach" is coaching).
**Status:** draft for stakeholder review. Matrix and notes only. No code, no SQL, no policy syntax.

## How to read this matrix

- **R** = may read the matching rows.
- **W** = may create or update the matching rows.
- **R+W** = both.
- **Deny** = no read and no write.
- **Row scope** says *which* rows, not only which table.
- Cells marked **(open Q#)** are not decided by the brief. They point to a question at the bottom. Do not treat them as final.

## Matrix

| Data kind (logical) | Coaching | Scouting | Medical | Row scope and notes |
| --- | --- | --- | --- | --- |
| player_roster_shared_fields (`players`: name, position, team, jersey number) | R | R | R | Directory facts only, so every signed-in role can identify a player (brief rule 5). Does **not** include `players.notes`, which is scouting-note text. Who may *write* the roster is undecided: Deny for all three until answered (open Q6). Roster visibility for all three is pending stakeholder confirmation (open Q5). |
| game_facts (`games`: opponent, date, venue) | R | R | Deny | The brief gives coaching and scouting "game facts" and gives medical roster facts only. Write: Deny for all three until decided (open Q6). |
| scouting_notes (`scouting_events` rows, including their `notes`; `players.notes`) | Deny | R+W | Deny | Scouting only (brief rules 1 and 3). Whether scouting sees all scouting rows or only its own is undecided (open Q2). Coaching sees none of it, including event totals, until Q7 is answered. |
| medical_or_sports_science_data (table not created yet) | Deny | Deny | R+W | Medical only (brief rules 2 and 3). Whether medical sees all athletes or only assigned ones is undecided (open Q3). |
| practice_or_game_plans (table not created yet) | R+W | Deny | Deny | The brief names planning as coaching's goal. It does not say scouting or medical may read plans, so they are denied (open Q8). |

**Signed-out visitors:** Deny on every row above, for reads and writes (brief rule 4).

## Role summaries

### Coaching
- **Needs:** plan practices and games, and see roster and game facts.
- **Must not see:** scouting note bodies, scouting event rows, or any sports-science and medical rows.
- **May write:** practice and game plans only.

### Scouting
- **Needs:** record and review evaluation notes, with the roster and game facts needed to write them.
- **Must not see:** sports-science and medical rows, or coaching plans.
- **May write:** scouting notes only.

### Medical
- **Needs:** sports-science and medical data, plus roster facts to identify a player.
- **Must not see:** scouting notes, scouting event rows, game facts, or coaching plans.
- **May write:** sports-science and medical rows only.

## Deny by default

Anything not explicitly allowed in the matrix is **denied**. This covers new tables, new columns, and new roles.

These rules must hold for direct API and database calls, not just the app screens (brief rules 6 and 7). Hiding a menu is not enforcement.

## Open questions (resolve before any RLS migration)

1. **Role assignment.** How is a signed-in user mapped to coaching, scouting, or medical? For example: a column on a staff profile table, a claim in the sign-in session, or an invite table. Who is allowed to change a person's role?
2. **Scouting row ownership.** Do scouts see all scouting notes or only ones they created? The current tables have no author column. A new column would be needed for "own rows."
3. **Medical caseload.** Do medical staff see all athletes or only ones assigned to them? If assigned, where is the assignment stored?
4. **Dual roles.** Can one person be both coach and scout? If yes, is access the union of both roles, or are special rules needed? (Brief open question 3.)
5. **Roster visibility.** Do all three groups see the full roster, including jersey number? (Brief open question 5.)
6. **Roster and game writes.** Who may create or edit players and games? The brief names no role. The matrix denies all three for now.
7. **Event totals for coaching.** The scouting events table mixes facts (goal, assist) with note text. Does coaching need counts or totals from scouting events, and if so, from where? Row-level rules cannot hide one column in a row.
8. **Plans for other roles.** Does scouting need to read opponent or schedule context from plans? Does medical need a simple "availability" flag, kept separate from full plans?
9. **Notes on the shared roster table.** `players.notes` sits on a table every role reads. Should scouting notes move to their own table before RLS is written? (Brief open question 1.)
10. **Break-glass access.** Who approves emergency access to medical data outside these rules, and is a fourth privileged role needed? Out of scope for Sprint 4 unless stakeholders say otherwise.

## Acceptance checks

- [ ] Exactly three roles, matching the brief's staff groups.
- [ ] Every sensitive data kind in the brief has a row.
- [ ] Medical raw data is not readable by coaching or scouting.
- [ ] Scouting notes are not readable by coaching or medical.
- [ ] Every allow cell has a row-scope phrase.
- [ ] Every cell the brief does not decide points to an open question.
- [ ] Signed-out access is denied everywhere.
