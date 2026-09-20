# Sprint 1 handoff — Hockey Ops Player Directory

**For:** Hockey ops staff / course reviewer
**Status:** Sprint 1 scope complete (see `docs/requirements-brief.md` for
what Sprint 1 does and doesn't cover)

## What's working right now

- **Home (`/`)** — landing page naming the app and linking into Players and
  Games.
- **Players (`/players`)** — full roster list, server-rendered, showing
  name, number, position, team, and status for each player.
- **Player detail (`/players/$playerId`)** — one page per player at a
  stable URL (e.g. `/players/2`). Bookmark it, close the tab, reopen the
  URL — same player comes back. An id that doesn't match any player shows
  a plain "no player matches" message instead of an error page.
- **Games (`/games`)** — schedule list, server-rendered, showing opponent,
  date, home/away, and result when there is one.
- **Nav** — Home / Players / Games (and the starter's About page) are
  reachable from every page.

All of the above is real HTML in the first response from the server — you
can confirm this by disabling JavaScript, or with `curl`, and the content
is still there (see `docs/verification-notes.md` for exact checks run).

## What this is not yet

- **Not real data.** Everything above is seed/demo content in
  `src/data/hockeySeed.ts`, not a live database. Swapping that in is a
  later sprint's work, and the loader layer (`src/server/directoryLoader.ts`)
  exists specifically so that swap doesn't touch any page.
- **No auth, no editing.** Anyone who can load the site can view it; there's
  no login and no way to add/edit players or games from the UI.
- **No live NHL feeds or payments.** Out of scope for this sprint (and the
  ones immediately after it).

## Where things live, if you want to look yourself

- Requirements this sprint was scoped against: `docs/requirements-brief.md`
- What was actually checked and how: `docs/verification-notes.md`
- Seed data: `src/data/hockeySeed.ts`
- Route files: `src/routes/index.tsx`, `src/routes/players/index.tsx`,
  `src/routes/players/$playerId.tsx`, `src/routes/games/index.tsx`
