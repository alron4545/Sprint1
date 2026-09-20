# Vercel Hobby setup — hockey ops directory

**Date:** 2026-09-04
**Vercel plan:** Hobby (free) — _confirm this is what shows in Vercel project settings, not a Pro trial_

## URLs (the same ones you will reuse all semester)

| Item | Value |
| --- | --- |
| GitHub repository (you can push) | `https://github.com/alron4545/Sprint1` |
| Instructor collaborator | `thortek` added: _confirm in GitHub → Settings → Collaborators_ |
| Vercel Production URL | `https://sprint1-olive.vercel.app/` |
| Preview URLs | Do **not** submit these to Canvas |

## Hobby constraints I will keep

- One Vercel project for this course — this one, imported from `alron4545/Sprint1`.
- Production deploys from `main` only.
- No cron / Fluid Compute / paid add-ons.
- Secrets go in the Vercel dashboard later (Sprint 2's Supabase keys) — never in git.

## What made the first deploy work

`vite.config.ts` had no deployment adapter at all before this step — just
`tanstackStart()`, `tailwindcss()`, and `viteReact()`. Per this exact
package version's own bundled deployment guide
(`node_modules/@tanstack/start-client-core/skills/start-core/deployment/SKILL.md`),
Vercel goes through Nitro, so `nitro` (installed as
`nitro@npm:nitro-nightly@latest`) and `nitro()` were added to the Vite
plugin list before the first deploy — not a static `outputDirectory: "dist"`
workaround, which would have dropped server rendering entirely.

## First production deploy

- Status: **Ready**
- Verification: independently fetched the live Production URL directly
  (not through a browser session that could be caching something) and
  confirmed real, request-specific content — home page shows "6 players on
  the roster (5 active)" and "3 games... next matchup vs North Bay on
  2026-03-14" (matches `src/data/hockeySeed.ts` exactly); `/players` lists
  all 6 real players; `/players/p-17` shows Alex Mercer's real detail;
  `/players/does-not-exist-999` shows the real `NotFoundPlayer` message,
  not a crash or blank page. This is the production equivalent of
  `docs/acceptance-checklist.md`, and it holds up.
- Incognito check of Production URL: _do one manual pass yourself too,
  since a fetch from outside a browser isn't quite the same as a private
  window — but functionally this is already confirmed working._

## Regression found and fixed (2026-09-20)

Checked the live Production URL directly and got a **404**. Root cause:
somewhere during an earlier, unrelated cleanup this semester (recovering
docs and removing a duplicate `src/` tree after a bad zip merge), the
`nitro` dependency and the `nitro()` plugin documented above had been
lost from `package.json` and `vite.config.ts` — confirmed by checking
`origin/main` on GitHub directly, not just the local working copy.
Without Nitro, the build produces a plain client bundle with no server
runtime, which is exactly a 404 in production.

Fix: reinstalled the same way as the first deploy
(`npm install nitro@npm:nitro-nightly@latest`) and re-added `nitro()` to
`vite.config.ts`'s plugin list, right after `tanstackStart(...)`.
Verified locally before pushing: `npm run build` now generates
`.output/server/index.mjs` (the actual Nitro server entry point) again,
not just a static `dist/`; `npx tsc --noEmit` and `npm test` (10/10) are
still clean; grepped `.output/public` (the assets actually served to the
browser) for `SUPABASE_SERVICE_ROLE_KEY`/`service_role`/
`getSupabaseServerClient`/`directory_people`/`jersey_no`/`SUPABASE_URL` —
no matches.

**Still needed for production to show real directory data (not just stop
404ing):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
and `SUPABASE_SERVICE_ROLE_KEY` need to be added in Vercel's dashboard
(Project → Settings → Environment Variables) — no real Supabase project
has been provisioned yet, so `/directory` will still show its own
`UPSTREAM`/`UNKNOWN` error state after this fix deploys, which is the
correct, secret-free behavior for "server function works, but there's no
real backend behind it yet."
