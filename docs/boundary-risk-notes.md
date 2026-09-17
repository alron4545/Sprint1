# Boundary risk notes — Hockey Operations Directory (Sprint 2, Topic 1)

## Client story (one paragraph)

The directory must load real player and staff data from Supabase instead of
the hardcoded seed data it uses today (`src/data/hockeySeed.ts`). Unlike that
seed file — which is just a `.ts` file anyone with the code can already read —
Supabase requires a credential to authorize any read; it will not return data
to an anonymous request. If the Supabase service-role key ends up in any file
Vite ships to the browser, anyone can extract it via DevTools (Network or
Sources tab) and query the database directly with full read/write access,
bypassing the app entirely. This sprint moves data loading behind a TanStack
Start server function, separates public vs. secret env vars, and extracts
pure mappers we can unit-test with Vitest — so that boundary is enforced by
structure, not by remembering to be careful.

## What might naively run in the client (risks)

- Creating a Supabase client directly inside a route file or component (e.g.
  `src/routes/players/index.tsx`) with the service-role key read from env.
- Extending `src/server/directoryLoader.ts` to call Supabase but keeping it
  importable from client-rendered components — the file living under
  `src/server/` today only holds that boundary by convention, not by any
  enforced mechanism, since it currently just reads the local seed module.
- Calling Supabase from a `useEffect` or a button's event handler, which
  would put the client that constructed it (and any key it holds) into the
  browser bundle.
- Naming a secret env var with a client-exposed prefix (e.g.
  `VITE_SUPABASE_SERVICE_ROLE_KEY`) "just to get it working locally."
- Logging a full env object, request config, or raw Supabase error payload
  to the browser console during debugging and forgetting to remove it.
- One shared `supabase.ts` module imported by both server and client code,
  so a secret meant for server-only use gets pulled into the client's
  dependency graph without anyone intending it.

## What must move server-side

- Any code path that uses the Supabase **service-role** key.
- The actual directory read (fetching player/staff rows) — this replaces
  what `listPlayers()` / `getPlayerById()` in `directoryLoader.ts` do today
  against the seed array, but against a real Supabase query instead.
- A dedicated server-only Supabase client module (e.g.
  `src/lib/supabase.server.ts`), never imported by anything under
  `src/routes/**` or `src/components/**`.
- Reading `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from `process.env` —
  this must happen in a server-only module, not in a shared config file
  that client code also imports.

## What may stay in the client

- The existing presentational UI: the players table, filter controls,
  loading/empty states (`src/routes/players/index.tsx`,
  `src/components/*`).
- Calling the TanStack Start server function and rendering whatever plain
  data-transfer shape it returns — the component never sees a credential,
  only the already-fetched rows.
- The `PlayerPosition` / `PlayerRosterStatus` type definitions currently in
  `hockeySeed.ts` — these are just shape information, not secrets, and can
  stay wherever is most convenient once real rows replace the seed array.

## Success criteria for this tutorial (checklist)

- [ ] `.env.example` exists, lists `SUPABASE_URL` and
      `SUPABASE_SERVICE_ROLE_KEY` by name only (no real values), and neither
      name uses a client-exposed prefix.
- [ ] A server-only Supabase client module exists and a repo-wide search for
      its import path turns up zero matches under `src/routes/` or
      `src/components/`.
- [ ] A TanStack Start server function loads directory data; `players/index.tsx`'s
      loader calls that function and never imports Supabase or reads a
      Supabase env var directly.
- [ ] Pure mapping/filtering logic (row → UI view model) lives in its own
      module with no network or env access, separate from the server
      function that fetches the rows.
- [ ] Vitest is configured and running; at least one test on the mappers
      fails when given a deliberately wrong expectation and passes once
      corrected (proves the test actually exercises the code, not just
      exists).
- [ ] Building the app (`npm run build`) and inspecting the emitted client
      bundle for the strings `SUPABASE_SERVICE_ROLE_KEY` and `service_role`
      turns up zero matches.
- [ ] Loading `/players` in the browser and checking the Network tab shows
      the rendered data but no Supabase key in any request, response, or
      inline script.

## Out of scope for this topic (do not solve here)

- Supabase Auth / login, and any per-user authorization on top of the
  directory read.
- Playwright end-to-end coverage — this topic only covers unit tests on the
  pure mappers.
- Production deployment or hosting configuration.
- Actually writing the server function, Supabase client, or mappers — this
  document is planning only; later steps in this topic implement it.

## Open questions to resolve in later steps

- Exact shape of the row `PlayerRow` type coming back from Supabase, and
  whether it matches the existing `SeedPlayer` shape closely enough to reuse
  the current filter logic in `directoryLoader.ts` or whether that needs to
  be rewritten against the new shape.
- What happens in the UI if the Supabase query fails (network issue, bad
  credential, empty table) — not decided yet, but the server function's
  contract should account for it.
- Which of `directoryLoader.ts`'s existing functions (`listPlayers`,
  `getPlayerById`, `listGames`) get replaced by real Supabase-backed
  versions in this topic versus a later one.
