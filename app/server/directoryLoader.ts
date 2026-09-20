// Server-side directory helpers. For Sprint 1 these just read the in-memory
// seed module (src/data/hockeySeed.ts) — no secrets, no network calls — but
// living under src/server/ marks this as the boundary that gets swapped for
// real Supabase reads in a later sprint without route files needing to
// change shape.
import {
  seedGames,
  seedPlayers,
  type GameVenue,
  type PlayerPosition,
  type PlayerRosterStatus,
  type SeedGame,
  type SeedPlayer,
} from '../data/hockeySeed'

export type ListPlayersFilters = {
  position?: PlayerPosition
  status?: PlayerRosterStatus | 'all'
}

export function listPlayers(filters?: ListPlayersFilters): SeedPlayer[] {
  let rows = [...seedPlayers]
  if (filters?.position) {
    rows = rows.filter((p) => p.position === filters.position)
  }
  if (filters?.status && filters.status !== 'all') {
    rows = rows.filter((p) => p.status === filters.status)
  }
  return rows
}

export function getPlayerById(playerId: string): SeedPlayer | undefined {
  return seedPlayers.find((p) => p.id === playerId)
}

export type ListGamesFilters = {
  /** Matches against `opponent`, case-insensitive substring. */
  opponent?: string
  date?: string
  venue?: GameVenue
}

export function listGames(filters?: ListGamesFilters): SeedGame[] {
  let rows = [...seedGames]
  if (filters?.opponent) {
    const needle = filters.opponent.toLowerCase()
    rows = rows.filter((g) => g.opponent.toLowerCase().includes(needle))
  }
  if (filters?.date) {
    rows = rows.filter((g) => g.date === filters.date)
  }
  if (filters?.venue) {
    rows = rows.filter((g) => g.venue === filters.venue)
  }
  return rows
}

// --- listDirectoryEntries -------------------------------------------------
//
// Implements docs/server-function-contract.md's real directory contract:
// reads the (future) Supabase `directory_people` table via
// app/lib/supabase.server.ts, returning a closed field list and a
// secret-free { ok: false, error: { code, message } } shape on every
// failure. This evolves listPlayers() in place per the contract rather than
// adding a parallel file — but for now it's added alongside the existing
// Sprint 1 functions above, which app/routes/players/index.tsx still calls
// directly and which this step does not touch.
//
// Input validation happens inside the handler, not createServerFn's
// .validator() — a .validator() throw would bypass this file's
// error-shaping and reach the caller as a raw, unshaped error.

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
      // Catches getSupabaseServerClient() throwing (e.g. missing env vars)
      // as well as any unexpected failure — deliberately discarded rather
      // than forwarded.
      return {
        ok: false,
        error: { code: 'UNKNOWN', message: 'Something went wrong loading the directory.' },
      }
    }
  })
