# SSR verification notes (Sprint 1)

## What's wired (code-level, verified before browser checks)
- `src/data/hockeySeed.ts` — typed seed players (6, mixed positions, one on
  IR) and seed games (3, mixed home/away/scheduled/final).
- `src/server/directoryLoader.ts` — `listPlayers`, `getPlayerById`,
  `listGames`, all pure reads of the seed module.
- All four routes (`/`, `/players`, `/players/$playerId`, `/games`) now
  define a `loader` that calls into `directoryLoader.ts` and read the
  result with `Route.useLoaderData()` in the component body — verified by
  `grep -rn "loader:" src/routes/` returning all four files.
- Confirmed with `grep -rn "useEffect\|fetch(" src/routes/ src/server/
  src/data/` that there is no client-only `useEffect`/`fetch` pattern
  anywhere in the directory code — the anti-pattern this step explicitly
  forbids is not present.
- `npx tsc --noEmit` passes with zero errors after wiring all four loaders
  (this caught a real bug during development: `loaderDeps` was declared
  after `loader` in one route's options object, which silently broke type
  inference for the loader's `deps` argument — fixed by reordering).
- Player detail (`/players/$playerId`) renders a distinct "Player not
  found" message when `getPlayerById` returns nothing, sourced from the
  loader — not a thrown client error.

## First-paint checks (fill in from your own browser / hard refresh)
I could not run the dev server from this session to check View Source
myself — see note below — so these need a real check on your machine.

| Route | URL tested | Content visible on hard refresh? | Name/text found in View Source? | Notes |
|-------|------------|----------------------------------|----------------------------------|-------|
| Home | / | | | |
| Players list | /players | | | |
| Player detail | /players/p-17 | | | |
| Player detail (bad id) | /players/does-not-exist | | | |
| Games | /games | | | |

## Requirements-brief criteria
- [ ] No spinner-only empty shell on directory pages
- [ ] Player detail bookmark shows identity content without waiting on
      client-only fetch
- [ ] Invalid player id shows a clear message, not a crash
- [ ] Seed/mock acceptable; Supabase still stubbed: yes, intentionally —
      Sprint 2 replaces `src/server/directoryLoader.ts`'s seed reads with
      real Supabase queries behind the same function signatures.

## Agent follow-ups I needed
- Extended `SeedPlayer` with a `status` field beyond the lesson's literal
  scaffold, since Step 8 already shipped a working active/IR filter on
  `/players` that would otherwise have had nothing to filter against.
- Reordered `loaderDeps` before `loader` in the players and games route
  options — TanStack Router's type inference depends on declaration order
  within the options object, and having it after `loader` silently broke
  `deps` typing (caught by `tsc`, not by eye).

## Risks / next sprint
- `/games`'s `team` search param currently filters by opponent-name
  substring, not a real team code, because the seed schedule doesn't model
  team abbreviations yet — revisit the param name/shape once real team
  data exists.
- Replace seed reads in `src/server/directoryLoader.ts` with Supabase
  queries when auth and live data land (Sprint 2), keeping the same
  exported function names/shapes so route files don't need to change.

## Note on this session's verification limits
This device-bridge session runs its shell in a separate Linux VM from your
Mac. `npm run build` and `npm run dev` both fail here with a native-module
error (`Cannot find native binding` for `@rolldown/binding-linux-arm64-gnu`)
because `node_modules` was installed on your actual macOS machine, not in
this VM — it's an environment mismatch, not a bug in this code. The
TypeScript check and the grep-based checks above are real and passed; the
actual "hard refresh + View Source" checks in the table above need to
happen in your own terminal/browser, per the lesson's own Step 5.
