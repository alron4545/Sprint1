# Sprint 2 · Topic 1 Handoff — Server Functions, Secret Hygiene, First Vitest Suite

**For:** Hockey ops staff / course reviewer
**Status:** Topic 1 scope complete, with one item (live browser Network
check) left for manual verification — see section 3.

## 1. Summary (what shipped)

- Directory reads for the Hockey Operations Directory go through a
  TanStack Start **server function** (`listDirectoryEntries` in
  `app/server/directory.ts`) — the browser never talks to Supabase
  directly, and never receives a service-role client.
- Public vs. secret environment variables are separated and documented in
  `.env.example`: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are
  browser-safe by design; `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are
  server-only, read through `app/config/env.ts`'s `serverEnv`, which
  throws if ever evaluated in a browser context.
- Pure directory mappers live in `app/lib/directory/mappers.ts` (zero
  imports — no Supabase, no env, no network) and are covered by
  `app/lib/directory/mappers.test.ts`.
- UI entry point: `app/routes/directory.tsx` calls `listDirectoryEntries`
  and renders its result, including a real error state and a real empty
  state — it does not import `supabase.server.ts` or read any env var.
- This is a new, separate page from `/players` and `/games`, which still
  read Sprint 1's seed data through `app/server/directoryLoader.ts` and
  were not touched.

## 2. Boundary decisions (keep these stable)

| Concern | Decision | Where it lives |
| --- | --- | --- |
| Who talks to Supabase with privileged credentials | Server only, via `getSupabaseServerClient()` | `app/lib/supabase.server.ts`, called only from `app/server/directory.ts` |
| What the browser is allowed to know | `VITE_`-prefixed public vars only; never the service-role key | `.env.example`, `app/config/env.ts` (`publicEnv`), `app/routes/directory.tsx` |
| How input validation fails safely | Validated inside the `.handler()`, not `createServerFn`'s `.validator()` — a validator throw would bypass error-shaping and reach the caller raw | `app/server/directory.ts`, explained in `docs/server-function-contract.md` |
| What is unit-tested in isolation | Pure map/validate helpers, no network | `app/lib/directory/mappers.ts` + `app/lib/directory/mappers.test.ts` |
| Contract for the load path | Inputs (`search`/`role`/`limit`), output shape, and error codes (`VALIDATION`/`UPSTREAM`/`UNKNOWN`) agreed before coding | `docs/server-function-contract.md` |

## 3. Secret hygiene proof (checklist)

- [x] `.env.example` lists required vars by **name** only, with empty
      values — no real secrets committed. Confirmed by reading the file
      directly.
- [x] Secret/service keys are read only in server modules. Confirmed:
      `app/lib/supabase.server.ts` is the only file that imports
      `serverEnv`'s `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` getters, and
      `app/server/directory.ts` is the only file that imports
      `getSupabaseServerClient`.
- [x] `app/routes/directory.tsx` does **not** import the server Supabase
      client or read service-role env vars. Confirmed by grepping
      `app/routes/` and `app/components/` for `supabase.server`,
      `serverEnv`, and `SUPABASE_SERVICE_ROLE_KEY` — the only match was a
      comment mentioning the filename, not an actual import.
- [x] Production client bundle (`npm run build` → `dist/client`) contains
      no `directory_people`, `jersey_no`, `SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, or `service_role` strings. Checked
      after every change to `app/server/directory.ts` in this topic, most
      recently with a fresh build immediately before this handoff was
      written.
- [x] Real `.env`/`.env.local` files remain gitignored (`.gitignore` lines
      9–11) and none exist on disk in this project yet — no real Supabase
      project has been provisioned (see Leftover risks).
- [ ] **Not verified by me — needs a manual check:** live browser
      DevTools Network inspection of `/directory` while the dev server is
      running. I attempted this myself (started `npm run dev`, requested
      browser-pane access to `localhost:3000`) but this environment can't
      reach a service bound to your machine's localhost — the same known
      limitation that blocked `curl` earlier in this project. Please open
      `/directory` yourself, open DevTools → Network, and confirm no
      `SUPABASE_SERVICE_ROLE_KEY` or secret value appears in the request
      or response.

**Proof notes:**
- Command run for tests: `npm test` (Vitest `5.0.1`)
- Directory route checked: `app/routes/directory.tsx` (source + compiled
  client chunk read directly, not just grepped)
- Bundle observation: grepped `dist/client` for
  `SUPABASE_SERVICE_ROLE_KEY|service_role|getSupabaseServerClient|directory_people|jersey_no|SUPABASE_URL` —
  no matches at every checkpoint in this topic.

## 4. Test status

- Vitest config present: `vitest.config.ts` (`environment: 'node'`,
  `resolve.tsconfigPaths: true`, `include: ['app/**/*.test.ts']`)
- Suite path: `app/lib/directory/mappers.test.ts`
- Result at handoff time: **PASS** — 10/10 tests, 1 file
  (`npm test` run immediately before writing this document)
- Behaviors protected: `mapDirectoryPersonRow` renames columns to the UI
  shape and preserves `null` for a missing team/position/jersey number
  instead of inventing `""`/`0`; `parseListDirectoryEntriesInput` covers
  empty-input defaults, whitespace-only search collapsing, non-string
  search rejection, the player/staff-only role allowlist, limit clamping
  at both the 1 and 200 ends, and non-numeric limit rejection.
- The suite was proven to actually fail, not just pass by coincidence: a
  deliberately wrong expectation (asserting a limit of 500 should stay
  500 instead of clamping to 200) was run first, produced a real
  expected/received failure, and was then corrected — the mapper logic
  itself was never touched.

## 5. Leftover risks / known gaps

- [x] **No real Supabase project or `directory_people` table exists yet.**
      This is the most concrete gap: `docs/server-function-contract.md`
      describes the table as already created "in the previous step," but
      it hasn't been provisioned. `listDirectoryEntries` is implemented
      and tested against its own validation/mapping logic, but has never
      run against a live table — visiting `/directory` right now shows
      the function's own `UNKNOWN`/`UPSTREAM` error state (expected
      behavior, not a bug), never real rows.
- [ ] Auth-aware directory loads not in scope yet (who is allowed to see
      which rows) — there is currently no login at all.
- [ ] Supabase RPC / richer server workflows not wired yet.
- [ ] No end-to-end (Playwright) coverage — only the pure mappers have
      automated tests; the server function's Supabase-calling path and
      the route's rendering are only manually/visually verified.
- [ ] The live-browser Network check in section 3 is still open, pending
      your own verification.

## 6. What rolls into the next Sprint 2 topic

**Recommendation:** Before auth-aware loads or RPC, provision the actual
Supabase project and `directory_people` table (per
`docs/server-function-contract.md`'s schema: `id, full_name, role, team,
position, jersey_no, created_at`) and seed it with a few rows, then
re-verify `/directory` against live data. Everything built in this topic
is contract-correct and unit-tested, but it has never been exercised
against a real database — that's a bigger unknown right now than which
feature comes next.

**Why:** Building auth-aware filtering or RPC calls on top of a table
that doesn't exist yet risks discovering schema mismatches (column types,
the `role` check constraint's exact allowed values) at the same time as
debugging new feature code, instead of one problem at a time. Once real
data is flowing, **auth-aware loads** is the more natural next step of
these three — RPC and richer workflows both assume there's already
something worth protecting with a role check, which auth would establish
first.

## 7. File map for the next reader

| Path | Role |
| --- | --- |
| `docs/boundary-risk-notes.md` | Why browser-held secrets fail the client story |
| `docs/client-vs-server-inventory.md` | What runs where |
| `docs/server-function-contract.md` | Agreed server-function inputs/outputs/error codes |
| `.env.example` | Public vs. secret env names for the team |
| `app/config/env.ts` | Typed `publicEnv`/`serverEnv` access, with a runtime browser guard on `serverEnv` |
| `app/lib/supabase.server.ts` | Server-only Supabase client (`getSupabaseServerClient`) |
| `app/server/directory.ts` | `listDirectoryEntries` server function |
| `app/server/directoryLoader.ts` | Unrelated Sprint 1 loaders (`listPlayers`/`getPlayerById`/`listGames`) still used by `/players` and `/games` — not part of this topic |
| `app/routes/directory.tsx` | UI wired to `listDirectoryEntries` |
| `app/lib/directory/mappers.ts` | Pure mappers/validators |
| `app/lib/directory/mappers.test.ts` | First Vitest suite |
| `vitest.config.ts` | Test runner config |

## 8. Stakeholder one-liner

The Hockey Operations Directory now loads through a server-only path with
secrets kept off the client and a first automated test safety net around
its data-shaping logic — the one thing still needed before this is real
end-to-end is standing up the actual Supabase table it's designed to
read from.
