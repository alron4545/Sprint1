# Stakeholder handoff — Hockey Ops Player Directory (Sprint 1)

**Audience:** Hockey operations leads and anyone triaging the next sprint
**App:** TanStack Start player directory (local dev)
**Repository:** https://github.com/alron4545/Sprint1
**Date:** 2026-09-04

## Delivered now (what staff can do)

- Open the **home page** and see real directory content right away — a
  roster count, a games count, and the next scheduled game — not an empty
  screen or a long spinner. That matters on arena wifi.
- Browse the **players list** and **games list** from the same navigation
  bar on every page, which visibly shows which section you're in.
- Open a **specific player's page** at a stable web address (for example
  `/players/17`), and **bookmark or text that link to someone else** — it
  reopens the same player every time, even without visiting the home page
  first.
- **Filter the players list** by position or roster status, and **filter
  the games list** by opponent or date, using the page's own links — and
  reloading the page or reopening a saved/shared filtered link keeps the
  same filter.
- See a clear, friendly **"player not found"** message (with a link back
  to the roster) if a bookmark is old or an id is mistyped, instead of a
  blank page or an error screen.

Every bullet above was personally checked and recorded, with the exact
steps and what was observed, in `docs/acceptance-checklist.md` (11 of 11
checks passed).

## Known limitations (do not assume these work yet)

- **Sample data only:** Every player name, number, and game on the site
  right now is made-up placeholder data, **not** the real club roster or
  schedule. Nothing here reflects an actual player or game.
- **No staff login yet:** There's no sign-in. Anyone with the link can view
  every page — there's no way yet to restrict who sees what.
- **No shared/production web address yet:** This has only been tested on
  one developer's computer. There is no link yet that anyone besides that
  developer can open.
- **No automated safety checks yet:** Nothing runs automatically to catch
  a broken page before it ships — that's next-sprint work.
- **"View games" from a player page doesn't actually filter to that
  player's games yet.** It links to the games page and shows a banner
  naming the player, but because there's no real data connecting a player
  to specific games yet, it currently shows the *full* schedule, not a
  narrowed one. Worth knowing so nobody expects a personalized schedule
  from that link today.

## How to try it (high level)

1. Get the project running locally (a developer can `npm install` then
   `npm run dev` from the project folder — see `docs/scaffold-notes.md`
   for exact commands and what to expect).
2. In a browser, open the home page, then Players, a specific player, and
   Games, using the nav bar at the top.
3. Copy a player's web address, open it in a new private/incognito
   window, and confirm it opens straight to that same player — that's the
   "bookmarkable" test.

Full step-by-step results (including what was checked in the raw page
source to confirm content loads without waiting on JavaScript) live in
`docs/acceptance-checklist.md` and `docs/ssr-verification-notes.md`.

## Recommended next sprint

1. **Live data:** Replace the sample data with real reads from Supabase
   (using database queries where filtering/lookup logic belongs there),
   with TanStack Query managing that data on the client where it helps.
2. **Login:** Add Supabase Auth so only authorized staff can view or use
   the directory, with clear behavior for someone who isn't signed in.
3. **Automated safety checks:** Add Vitest (for the small validation
   helpers) and Playwright (for the bookmark and first-load checks done by
   hand this sprint), running automatically on every change.
4. **A real shared web address:** Deploy to Vercel so the directory has a
   URL anyone on the team can open, and re-run this sprint's checklist
   against that live URL.
5. **Connect players to their actual games:** Model the real relationship
   between a player and their games so the "View games" link can genuinely
   filter, instead of just labeling the full schedule.

## One-line summary for leadership

Staff can already open bookmarkable player and game pages that show
content immediately, with working filters and a friendly message for bad
links; the next sprint should connect the real roster and schedule, add
login, add automated checks, and put it on a shared web address.
