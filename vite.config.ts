import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // `nitro()` is what lets this app deploy with working server rendering
  // and server functions on Vercel (and Railway/Node/Docker) — Nitro reads
  // the hosting platform from the build environment automatically.
  // See node_modules/@tanstack/start-client-core/skills/start-core/deployment/SKILL.md.
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
