import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// nitro() is required for Vercel (and any non-static) deployment — without
// it, the build produces a plain client bundle with no server runtime, and
// the deployed site 404s instead of running SSR / server functions. See
// docs/vercel-hobby-setup.md for the first-deploy history and
// node_modules/@tanstack/start-client-core/skills/start-core/deployment/SKILL.md
// for why Nitro is the deployment layer TanStack Start builds on.
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({ srcDirectory: 'app' }),
    nitro(),
    viteReact(),
  ],
})

export default config
