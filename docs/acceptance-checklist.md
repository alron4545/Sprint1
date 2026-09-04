# Acceptance checklist — Hockey ops player directory (Sprint 1)

**App under test:** TanStack Start player directory (local dev)
**Date:** 2026-09-04
**Tester:** Michael Schuler
**Overall status:** ready

## Summary for hockey ops
- Passes: 11
- Fails: 0
- Blockers for demo: none

## How to re-run
1. From the project folder (`Sprint1`), start the dev server: `npm run dev`.
2. Open the local URL shown in the terminal (usually `http://localhost:3000`).
3. Walk each row below in order; fill in Result (pass/fail) and Evidence
   as you go. Don't mark pass without something concrete you actually saw.

## Criteria (from docs/requirements-brief.md, docs/route-map.md, docs/ssr-verification-notes.md)

Real seed data tested against (from `src/data/hockeySeed.ts`): players
`p-17` (Alex Mercer, F, active), `p-30` (Sam Ortiz, G, on IR), `p-4` `p-9`
`p-22` `p-1`; games opponent `North Bay` on `2026-03-14`.

| ID | Criterion | How tested | Result | Evidence | Notes / next action |
|----|-----------|------------|--------|----------|---------------------|
| A1 | Home (`/`) loads and shows directory-oriented content, not a blank shell | Opened `/` after a fresh load | pass | Home heading, roster/game counts, and Players/Games links visible immediately | |
| A2 | Players index is reachable from nav and lists seed players | Clicked Players from nav | pass | All 6 seed players listed, including Alex Mercer and Sam Ortiz | |
| A3 | Player detail is bookmarkable: direct load in a fresh session | Pasted `/players/p-17` directly into a private/incognito window | pass | Alex Mercer's detail page loaded immediately, no need to visit Home first | |
| A4 | Invalid player id shows a clear not-found state, not a crash | Opened `/players/does-not-exist-999` | pass | `NotFoundPlayer` message shown with a working link back to `/players` | |
| A5 | Games index loads and is linkable | Opened `/games` | pass | All 3 seed games listed, including the North Bay game | |
| A6 | Player search filters restore on reload | Opened `/players?position=F&status=active`, reloaded | pass | Same filtered (forwards, active-only) list reappeared after reload | |
| A7 | Games search filters restore on reload | Opened `/games?team=North%20Bay&date=2026-03-14`, reloaded | pass | Same single filtered game reappeared after reload | |
| A8 | Invalid search params degrade safely, don't crash | Edited URL to `/players?position=WING&status=bogus` | pass | Page fell back to showing all positions/statuses instead of erroring | |
| A9 | Server-rendered first content: seed name appears in initial HTML | View Page Source on `/players`, searched for "Alex Mercer" | pass | Name found directly in the raw HTML source, not only after JS ran | |
| A10 | Cross-links between player detail and games don't 404 | Clicked "View games — Alex Mercer" from `/players/p-17`, then "Back to Alex Mercer" from `/games` | pass | Both directions navigated correctly, no 404 | |
| A11 | Main nav reaches Home, Players, Games from every page, and highlights the current section | Clicked each nav item from Home, Players, a player detail, and Games | pass | Correct destination each time; only the current section's nav item shows as active (confirmed Home no longer stays highlighted away from `/`) | |

## Gaps log (fails only)

No fails on this pass — nothing to log.

## Sign-off
- [x] Checklist matches criteria in docs/requirements-brief.md
- [x] Bookmark test (A3) done in a fresh/private browser session
- [x] At least one SSR/first-document check (A9) recorded
- [x] Fails (if any) have next actions for handoff — N/A, no fails

**Ready for stakeholder handoff step?** yes — all Sprint 1 acceptance criteria pass with recorded evidence; no known blockers.
