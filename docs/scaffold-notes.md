# Scaffold notes — hockey ops player directory

## What we generated
- Scaffolded via `npx @tanstack/cli@latest create` (the current TanStack CLI — note: the older `create-tsrouter-app` command is now deprecated and prints a warning telling you to switch to this one).
- TanStack Start app with React, TypeScript, Vite, and Tailwind CSS v4.
- No player/games product features yet — routes come in a later step.

## Key files (what actually appeared)
- `package.json` — dependencies and scripts. Scripts are `dev`, `build`, `preview`, and `generate-routes` — there is **no `start` script** in this version of the starter, so don't go looking for one.
- `vite.config.ts` — combines the Vite React plugin, the TanStack Start plugin, the Tailwind Vite plugin, and TanStack Devtools.
- `tsconfig.json` — TypeScript compiler options (strict mode on by default).
- There is **no `tailwind.config.ts` file at all** — Tailwind v4 configures itself through `@import "tailwindcss"` directly inside `src/styles.css`, with an optional `@theme { ... }` block for custom tokens. If your own scaffold is missing this file, that's expected, not a mistake.
- `src/styles.css` — global styles; imports Tailwind and defines the starter's color/theme tokens.
- `src/routes/` — file-based routes (`index.tsx`, `about.tsx`, `__root.tsx` layout).
- `src/router.tsx` and `src/routeTree.gen.ts` — the router setup and its auto-generated route tree.
- `AGENTS.md` — a generated file of guidance for AI coding agents working in this repo (new addition from the current CLI's "TanStack Intent" feature).

## How I verified
1. Ran the scaffold command, which installed dependencies automatically (`node_modules` present afterward).
2. Ran `npm run dev`.
3. Vite printed `Local: http://localhost:3000/`.
4. Requested that URL and got back a full HTML page with real visible content already in it (headings, nav links, feature cards) — not an empty `<div id="root"></div>` waiting on JavaScript. That's the server-rendered first paint the brief calls for.
5. Stopped the dev server with Ctrl+C when done checking.

## Layout notes for later steps
- Application source lives under `src/`.
- Routes will be added under `src/routes/` in the next steps (e.g. `players.tsx`, `players.$playerId.tsx`, `games.tsx`).
- Requirements live in `docs/requirements-brief.md`.

## Issues / surprises hit
- The lesson material's sample `package.json` listed a `"start": "vite preview"` script; the real, current starter does not include a `start` script at all (just `dev`, `build`, `preview`). Worth checking which script your deployment step actually expects.
- The scaffolding CLI itself has moved on: `create-tsrouter-app` (mentioned in some older docs/tutorials) is deprecated in favor of `npx @tanstack/cli create`. Both still work, but the CLI warns about it.
- Tailwind v4 does not generate a `tailwind.config.ts` — configuration now lives inside `src/styles.css` via `@import "tailwindcss"` and an `@theme` block. This differs from Tailwind v3's file-based config that some older tutorials still describe.
