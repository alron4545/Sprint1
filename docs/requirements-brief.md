# Hockey Ops Player Directory — Requirements Brief (Sprint 1)

## Overview

Hockey operations needs a **player directory** staff can open on arena wifi and use immediately. Real directory content should appear on **first paint** (the first HTML the browser shows), not only after a client-side loading spinner. Every player must have a **linkable, bookmarkable** page URL.

This sprint delivers a TanStack Start skeleton: routes, validated params, and server-rendered page shells with seed/demo content. Real database data, auth, and live feeds are later sprints.

## Actors and goals

| Actor | Goal | Success looks like |
| --- | --- | --- |
| Hockey ops staff | Open the directory on weak wifi and see players/games right away | The first HTML response already lists directory content — no waiting on a spinner |
| Hockey ops staff | Share or bookmark one player | A URL like `/players/42` opens directly to that player's page, every time |
| Coach / scout (same app) | Browse the games list and jump back to players | `/games` works and nav links stay consistent across pages |
| Future developer (you) | Implement without re-guessing scope | This brief plus the acceptance checklist stay the source of truth |

## Route map (minimum for this sprint)

| Route name | URL pattern | Kind | Purpose |
| --- | --- | --- | --- |
| Home | `/` | Static | Landing page + short directory summary |
| Players index | `/players` | Static | List players; search/filter query params optional later |
| Player detail | `/players/$playerId` | Dynamic (path param) | One player's page; bookmarkable |
| Games index | `/games` | Static | List games; view/filter query params optional later |

Notes for implementers:
- `$playerId` is a **path param** — its value is part of the URL path itself.
- Filters (e.g. position, team) belong in **search params** (the `?key=value` part of the URL), and must be validated so a bad value can't crash the page.
- Nav must reach Home, Players, and Games from every page shell.

## Data shown on first paint (server-rendered)

For Sprint 1, content may come from a seed/demo data module loaded on the server — it does not need to be live database data yet — as long as staff see real-looking directory rows in the first HTML response.

| Page | Must appear in the first HTML (before any client-side JS runs) |
| --- | --- |
| Home | App title, short intro, links into Players and Games |
| Players index | At least a small list of player names (seed data is fine) |
| Player detail | Player id (and name if known); a clear not-found state if the id doesn't match |
| Games index | At least a small list of games (seed data is fine) |

## Type-safe links and params

- Internal navigation uses the router's type-safe link helper — no hand-typed URLs that can silently go stale.
- `playerId` is validated (exact rule — e.g. non-empty string vs. numeric id — to be decided in a later step).
- Search params for filters/views have defaults and safely reject or convert invalid values instead of crashing the page.

## Out of scope (this sprint)

- Real database-backed auth, login, or roles
- Live NHL feeds or paid external APIs
- Editing or creating players in the UI
- Payments, messaging, or a native mobile app
- A polished visual design system (basic Tailwind layout is enough)

## Acceptance criteria (browser-checkable)

1. Visiting `/` shows the home shell with visible directory-oriented content or navigation — not a blank page.
2. Viewing page source (or `curl`) for `/players` shows player names already present in the HTML — not just an empty container waiting on JavaScript.
3. Visiting `/players/<id>` for a known seed id shows that player's detail page; the URL can be copied, pasted into a new tab, and it reopens the same player.
4. Viewing page source (or `curl`) for `/games` shows game entries already present in the HTML.
5. Primary nav reaches Home, Players, and Games from any page, with no broken links.
6. Visiting `/players/<some-invalid-id>` shows a clear not-found/empty state rather than a raw crash page (a polished version can come in a later step).

## Sprint boundary

**Done for Sprint 1** means: a scaffolded TanStack Start app, a route tree matching this map, validated path/search params, server-rendered shells with seed directory content, short verification notes, and a stakeholder handoff note.

**Not done in Sprint 1**: a production data pipeline, real auth, or live external feeds.
