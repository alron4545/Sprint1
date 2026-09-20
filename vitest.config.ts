// vitest.config.ts
//
// Unit-test setup for the pure directory mappers (app/lib/directory/mappers.ts)
// and any other plain-function modules. Deliberately boring and
// secret-free: this file does not import app/lib/supabase.server.ts and
// does not read SUPABASE_SERVICE_ROLE_KEY or any other secret env var —
// pure mapper tests need plain objects, not a database connection.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Pure helpers, not React components — no browser DOM needed yet.
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
  resolve: {
    // Same mechanism vite.config.ts already uses: reads the '#/*' and
    // '@/*' aliases straight from tsconfig.json's "paths", so a test file
    // resolves imports exactly the way app code does — no separate alias
    // list to keep in sync by hand.
    tsconfigPaths: true,
  },
})
