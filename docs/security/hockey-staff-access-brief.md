# Hockey Staff Access Brief

**Status:** draft for stakeholder review. Requirements only. No login code, no SQL, no framework setup.
**Reader:** a teammate or coding agent who has not seen the client email.

## 1. Problem summary

Hockey operations staff share the same application tables. Coaching, scouting, and medical staff do different jobs. They must not all see the same rows.

Scouting notes are competitive intel. Sports-science and medical-related data is personal and health-adjacent. Each group needs its own slice of the data.

These rules must hold even when someone skips the normal screens and calls the API directly.

**Where the project stands today.** The scouting board built in Sprint 3 has no sign-in and no row-level security. Anyone who holds the public app key can read and change every row. This brief exists to close that gap. It is the starting point for Sprint 4.

## 2. Sensitive data (what we protect)

| Data | Why it is sensitive | Example misuse if leaked |
| --- | --- | --- |
| Scouting notes | Competitive intel on players and opponents | A non-scout reads draft targets or opponent weaknesses |
| Sports-science and medical-related measures | Personal performance and health-adjacent staff data | Coaching decisions or gossip based on data outside their role |

**Where scouting notes live today.** Free-text notes appear in two places:
- the `notes` field on each event (`scouting_events`)
- the `notes` field on each player (`players`)

The player table is also the shared roster that every role needs. See open question 1.

**Sports-science and medical data.** No table for it exists yet. Its location is an open question.

## 3. Staff groups and primary goals

| Staff group | Primary goal in the app | May see | Must not see |
| --- | --- | --- | --- |
| Coaching | Plan practices and games | Roster and game facts they need to plan | Scouting note bodies. Sports-science and medical rows. |
| Scouting | Record and review evaluation notes | Scouting notes, and the roster and game facts needed to write them | Sports-science and medical rows |
| Medical | Track sports-science and medical data | Sports-science and medical rows, and the roster facts needed to identify a player | Scouting note bodies |

Only these three groups exist. Do not add more without stakeholder approval.

## 4. Never-leak rules

These are hard rules. "Must not" means no exceptions in normal operation.

1. A coaching account **must not** read scouting-note rows.
2. A scouting account **must not** read sports-science or medical rows.
3. A medical account **must not** read scouting notes.
4. A signed-out visitor **must not** read or change any scouting, sports-science, or medical row.
5. Shared directory facts, such as a player's display name used for navigation, **may** be visible to all signed-in staff. Note bodies and science measures **must** stay role-bound.
6. Every rule above applies to **reads and writes**, not only to what appears on screen.
7. Every rule above applies to **direct API calls**, not only to the app's own screens.

## 5. Why "hide it in the UI" is not enough

Hiding a menu item or a column only changes what a friendly screen shows. Anyone who can call the API, reuse a session token, or open a network tool can still ask for the underlying rows.

Real protection needs three layers:

1. **Authentication.** Prove which staff member is signed in.
2. **Server-side session checks.** Server functions re-check that identity before running a sensitive query. They never trust the browser alone.
3. **Authorization in the database.** Row-level security means each role only receives the rows it is allowed to see, even on a direct call.

Today none of the three exist.

## 6. In scope for Sprint 4 (identity slice)

- Staff sign-in and sign-out with verified sessions.
- Server functions that refuse work when there is no valid session.
- A written role-to-data matrix and row-level security rules for coaching, scouting, and medical.
- One protected scouting data path that demonstrates filtered reads.

## 7. Out of scope (later work)

- Full HR onboarding of every employee account.
- Fine-grained edit workflows inside medical charts.
- Mobile-native apps.
- Third-party data warehouse exports.

## 8. Success criteria

- A new teammate can name the three staff groups and the two sensitive data types without rereading the client email.
- Every later sign-in and database-rule task can point back to a numbered rule in section 4.
- The brief states plainly that UI-only hiding is not enough.
- Stakeholders can approve or correct this document before any SQL is written.
- A test plan can check each never-leak rule with a direct call, not just a screen.

## 9. Open questions for stakeholders

1. **Player notes on a shared table.** Row-level security decides which *rows* a role gets. It cannot hide one *column* of a row. If `players.notes` stays on the roster table, any role that can read a player row can read the notes. Should scouting notes move to their own table before the rules are written?
2. Which table will hold sports-science and medical data? It does not exist yet.
3. Can one person hold two roles, such as coach and scout? Or are roles mutually exclusive for version 1?
4. Who approves emergency "break-glass" access if medical data is needed outside normal role paths?
5. Is roster information (name, position, team, jersey number) visible to all three groups?
