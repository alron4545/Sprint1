// The Sprint 2 Topic 1 server function described in
// docs/server-function-contract.md: loads directory rows (players and
// staff) from the real `directory_people` Supabase table through the
// server-only client in app/lib/supabase.server.ts, and returns a closed,
// UI-ready field list — never a raw database row, a driver error, an env
// var, or a secret.
//
// This is a new, separate module from app/server/directoryLoader.ts on
// purpose: directoryLoader.ts still holds the pre-existing Sprint 1
// listPlayers/getPlayerById/listGames functions that
// app/routes/players/index.tsx and app/routes/games/index.tsx call
// directly today, reading the in-memory seed data with a different
// position/status filter shape. Wiring listDirectoryEntries into a route
// is a separate, later step (see the contract's "Implementation status").
//
// Input validation happens inside the handler, not createServerFn's
// .validator(): a .validator() throw happens before .handler() runs, so it
// would bypass this file's error-shaping and reach the caller as a raw,
// unshaped error instead of the safe { ok: false, error } shape below.

import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../lib/supabase.server'
import {
  mapDirectoryPersonRow,
  parseListDirectoryEntriesInput,
  type DirectoryEntry,
  type DirectoryPersonRow,
} from './directoryMappers'

export type { DirectoryEntry, DirectoryRole } from './directoryMappers'

export type ListDirectoryEntriesErrorCode = 'VALIDATION' | 'UPSTREAM' | 'UNKNOWN'

export type ListDirectoryEntriesResult =
  | {
      ok: true
      entries: Array<DirectoryEntry>
      meta: {
        count: number
        appliedFilters: { search: string | null; role: string | null }
      }
    }
  | { ok: false; error: { code: ListDirectoryEntriesErrorCode; message: string } }

/**
 * Loads directory_people rows on the server via getSupabaseServerClient(),
 * filtered by an optional search/role and capped by limit, and maps each
 * row to the contract's DirectoryEntry shape. Every outcome — bad input,
 * a Supabase error, an unexpected exception, or success — comes back as a
 * ListDirectoryEntriesResult; nothing is ever thrown to the caller, and no
 * raw error, env var, or secret ever leaves this handler.
 */
export const listDirectoryEntries = createServerFn({ method: 'GET' })
  // No throwing here — see the file banner above. Raw input is validated
  // inside the handler via parseListDirectoryEntriesInput.
  .validator((raw: unknown) => raw)
  .handler(async ({ data: rawInput }): Promise<ListDirectoryEntriesResult> => {
    const parsed = parseListDirectoryEntriesInput(
      (rawInput ?? {}) as { search?: unknown; role?: unknown; limit?: unknown },
    )
    if (!parsed.ok) {
      return { ok: false, error: { code: 'VALIDATION', message: parsed.message } }
    }
    const { search, role, limit } = parsed.value

    try {
      // Server-only client, authenticated with the service-role key — see
      // app/lib/supabase.server.ts's own header for why this must never be
      // imported from client code. It is only ever called from inside this
      // handler, never at module scope.
      const supabase = getSupabaseServerClient()
      let query = supabase
        .from('directory_people')
        .select('id, full_name, role, team, position, jersey_no')

      if (role) {
        query = query.eq('role', role)
      }
      if (search) {
        query = query.ilike('full_name', `%${search}%`)
      }
      query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        // Never forward the raw Supabase error (driver message, hints,
        // possibly schema/config detail) to the caller.
        return {
          ok: false,
          error: { code: 'UPSTREAM', message: 'Directory temporarily unavailable.' },
        }
      }

      const entries = ((data ?? []) as Array<DirectoryPersonRow>).map(mapDirectoryPersonRow)

      return {
        ok: true,
        entries,
        meta: { count: entries.length, appliedFilters: { search, role } },
      }
    } catch {
      // Catches getSupabaseServerClient() throwing (e.g. missing
      // SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY) as well as any unexpected
      // failure from the query itself. Deliberately discards whatever was
      // caught — it might be a config message, a network error, anything
      // — and never forwards it.
      return {
        ok: false,
        error: { code: 'UNKNOWN', message: 'Something went wrong loading the directory.' },
      }
    }
  })
