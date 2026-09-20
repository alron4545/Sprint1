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
