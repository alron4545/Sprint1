# Decisions log — Sprint 1 (engineering)

Short, high-signal entries only. Full detail lives in the linked docs, not
here — this is a map, not the territory.

## D1 — Route tree matches ops jobs
- **Decision:** Shape of the route tree for home, players, player detail,
  games.
- **Choice:** Static routes for the list/hub pages (`/`, `/players`,
  `/games`); a dynamic `/players/$playerId` for detail.
- **Why:** Ops need shareable per-player links; the hub pages match a
  "browse the directory" job, not a per-item one. See `docs/route-map.md`.

## D2 — Type-safe path params
- **Decision:** How a player id gets from the URL into the app.
- **Choice:** Validated via a shared helper (`src/lib/playerParams.ts`,
  `parsePlayerIdParam`) rather than trusting the raw URL segment.
- **Why:** A malformed or empty id should fail predictably at one place,
  not wherever it happens to get used first.

## D3 — Search params for filters, and an honest limit on cross-linking
- **Decision:** How directory filters and player→games context live in
  the URL.
- **Choice:** Schema-validated, never-throwing search params
  (`src/lib/searchSchemas.ts`) on `/players` (`position`, `status`) and
  `/games` (`team`, `date`, `player`).
- **Why:** Refreshing or sharing a filtered link must reproduce the same
  view, and a garbage query string must degrade to a safe default instead
  of crashing.
- **Known gap, decided deliberately:** the `player` search key on
  `/games` currently *labels* the page for that player rather than
  filtering the schedule, because the seed data model
  (`src/data/hockeySeed.ts`) has no games-per-player relation. Faking a
  filter would have been worse than an honest label — see
  `docs/stakeholder-handoff.md` limitations.

## D4 — Server-rendered first paint with seed data
- **Decision:** What's in the HTML before client JS runs.
- **Choice:** Route `loader`s call into `src/server/directoryLoader.ts`,
  which reads `src/data/hockeySeed.ts`, on every one of the four main
  routes — no client-only `useEffect`/`fetch` for directory content.
- **Why:** Arena wifi makes a spinner-first load a real problem; seed data
  lets SSR be proven correct now, with the same function signatures ready
  to swap for real Supabase reads later. Verified in
  `docs/ssr-verification-notes.md` (View Source check, not just
  Inspect — Inspect would falsely pass a broken SSR setup).

## D5 — Navigation, empty states, and a TanStack Router gotcha worth knowing
- **Decision:** How staff move between pages, and what happens on a bad
  player id.
- **Choice:** A shared `AppNav` component with `activeProps` highlighting,
  plus a dedicated `NotFoundPlayer` component instead of an inline
  conditional.
- **Why:** A directory with a silent 404 or no visual "where am I" isn't
  usable in a hurry. **Watch for this:** `Link to="/"` needs
  `activeOptions={{ exact: true }}` explicitly — TanStack Router's default
  active-match is a path-prefix check, so without it the Home link stays
  visually "active" on every page, since every path starts with `/`. Easy
  to miss because it doesn't error, it just silently looks wrong.

## D6 — Extended the seed data model beyond the original scaffold
- **Decision:** Whether to keep `SeedPlayer` exactly as originally
  scaffolded (no roster-status field) or extend it.
- **Choice:** Added a `status: 'active' | 'ir'` field to `SeedPlayer`.
- **Why:** An earlier step had already shipped a working active/IR filter
  on `/players`; keeping the original scaffold shape as-is would have left
  that filter with nothing real to filter against.

## D7 — Stack baseline
- **Decision:** App foundation for this sprint.
- **Choice:** TanStack Start (Vite + React + TypeScript + Tailwind v4, no
  `tailwind.config.ts` — v4 configures via `src/styles.css`), per
  `docs/scaffold-notes.md`.
- **Why:** Fits the type-safe routing and SSR goals; leaves a clear path
  to Query, Supabase, and Vercel next.

## Explicit non-goals this sprint
- Live Supabase reads/writes, Supabase Auth, Vitest/Playwright CI, and a
  production deploy. All four are the recommended next sprint — see
  `docs/stakeholder-handoff.md`.
