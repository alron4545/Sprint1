// Single place the app reads environment variables from, split into two
// clearly separate exports:
//
//   publicEnv  — backed by Vite's `import.meta.env`. Only variables
//                prefixed VITE_ ever reach this object, and Vite is what
//                inlines those into the client bundle. Safe to import from
//                anywhere, including route components — nothing here is a
//                secret.
//
//   serverEnv  — backed by plain `process.env`. NEVER import this from a
//                route component, a component file, or anything else under
//                src/routes/** or src/components/** that renders in the
//                browser. Import it only from server-only modules (files
//                ending in `.server.ts`, or code under src/server/).
//
// See docs/client-vs-server-inventory.md for which values are public vs
// secret and why, and docs/boundary-risk-notes.md for the risk this split
// exists to prevent.
//
// Later steps (the Supabase server client, the directory server function)
// import from here instead of reading process.env / import.meta.env
// directly — that's what keeps the public/secret line in one place instead
// of being re-decided ad hoc in every file that needs a config value.

function missingVarMessage(name: string): string {
  return (
    `Missing env var "${name}". Copy .env.example to .env.local, fill in ` +
    `your Supabase project's values (Settings → API), and restart the ` +
    `dev server. See docs/client-vs-server-inventory.md for what each ` +
    `value is for.`
  )
}

/**
 * Values safe to expose to the browser. Reads only from
 * `import.meta.env.VITE_*`, which is Vite's own mechanism for deciding
 * what gets inlined into client-bundled code — nothing added here can
 * accidentally become "more public" than that.
 */
export const publicEnv = {
  get SUPABASE_URL(): string {
    const value = import.meta.env.VITE_SUPABASE_URL
    if (!value) throw new Error(missingVarMessage('VITE_SUPABASE_URL'))
    return value
  },
  get SUPABASE_ANON_KEY(): string {
    const value = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!value) throw new Error(missingVarMessage('VITE_SUPABASE_ANON_KEY'))
    return value
  },
}

/**
 * Server-only values. Do not import this export from anything that
 * renders in the browser. Real browser JavaScript has no `process` object
 * at all, so a route component that imports `serverEnv` and actually reads
 * a property off it will crash with a "process is not defined" error at
 * runtime — the guard below turns that into a clearer message instead.
 */
export const serverEnv = {
  get SUPABASE_URL(): string {
    assertServerOnly('SUPABASE_URL')
    const value = process.env.SUPABASE_URL
    if (!value) throw new Error(missingVarMessage('SUPABASE_URL'))
    return value
  },
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    assertServerOnly('SUPABASE_SERVICE_ROLE_KEY')
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!value) throw new Error(missingVarMessage('SUPABASE_SERVICE_ROLE_KEY'))
    return value
  },
}

function assertServerOnly(name: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      `serverEnv.${name} was read in a browser context. This value is ` +
        `server-only and must never be imported by a route component or ` +
        `anything else that bundles for the browser.`,
    )
  }
}
