// Pure helpers for listDirectoryEntries (app/server/directory.ts) — no
// Supabase import, no env access, no network call. Per
// docs/server-function-contract.md: "The row -> DirectoryEntry mapper and
// the input-validation logic are both extractable into their own pure
// functions, so a later step can unit-test them without touching
// Supabase." That later step is now — this file is what Vitest will
// import directly, with plain objects, no server/database involved.
//
// Field names below match the real directory_people columns already used
// in app/server/directory.ts (id, full_name, role, team, position,
// jersey_no) rather than a generic scaffold's names — there is no
// is_active column on this table, so no active/inactive filter exists
// here; see docs/server-function-contract.md for why that field is
// deliberately not invented.

export type DirectoryRole = 'player' | 'staff'

/** Exactly the fields docs/server-function-contract.md promises callers. */
export interface DirectoryEntry {
  id: string
  displayName: string
  role: DirectoryRole
  teamName: string | null
  positionOrTitle: string | null
  jerseyNumber: number | null
}

/** The columns SELECTed from directory_people — matches the contract's
 * mapping table (id, full_name, role, team, position, jersey_no). */
export interface DirectoryPersonRow {
  id: string
  full_name: string
  role: DirectoryRole
  team: string | null
  position: string | null
  jersey_no: number | null
}

export function mapDirectoryPersonRow(row: DirectoryPersonRow): DirectoryEntry {
  return {
    id: row.id,
    displayName: row.full_name,
    role: row.role,
    teamName: row.team,
    positionOrTitle: row.position,
    jerseyNumber: row.jersey_no,
  }
}

export interface ListDirectoryEntriesInput {
  search: string | null
  role: DirectoryRole | null
  limit: number
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string }

function parseSearch(raw: unknown): ParseResult<string | null> {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: null }
  }
  if (typeof raw !== 'string') {
    return { ok: false, message: 'search must be a string' }
  }
  const trimmed = raw.trim()
  return { ok: true, value: trimmed.length === 0 ? null : trimmed }
}

function parseRole(raw: unknown): ParseResult<DirectoryRole | null> {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: null }
  }
  if (raw === 'player' || raw === 'staff') {
    return { ok: true, value: raw }
  }
  // Deliberately not echoing the raw value back — see the contract's
  // "do not echo secrets" guidance. This isn't a secret, but there's no
  // need to reflect arbitrary caller-supplied input into a response
  // either.
  return { ok: false, message: 'role must be "player" or "staff"' }
}

function parseLimit(raw: unknown): ParseResult<number> {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: 100 }
  }
  const num = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN
  if (!Number.isFinite(num)) {
    return { ok: false, message: 'limit must be a number' }
  }
  // Contract says "clamp between 1 and 200" for range, not reject — a
  // non-numeric limit is the only VALIDATION case for this field.
  return { ok: true, value: Math.min(200, Math.max(1, Math.round(num))) }
}

/**
 * Validates and normalizes raw caller input into the shape
 * listDirectoryEntries' query needs. Returns the first validation failure
 * found, never a thrown exception — see app/server/directory.ts for why.
 */
export function parseListDirectoryEntriesInput(raw: {
  search?: unknown
  role?: unknown
  limit?: unknown
}): ParseResult<ListDirectoryEntriesInput> {
  const search = parseSearch(raw.search)
  if (!search.ok) return search
  const role = parseRole(raw.role)
  if (!role.ok) return role
  const limit = parseLimit(raw.limit)
  if (!limit.ok) return limit
  return { ok: true, value: { search: search.value, role: role.value, limit: limit.value } }
}
