import { describe, it, expect } from 'vitest'
import { mapDirectoryPersonRow, parseListDirectoryEntriesInput } from './mappers'

// Sample shapes mirror the real directory_people columns the server
// selects (id, full_name, role, team, position, jersey_no) — not an
// invented schema.
const activePlayerRow = {
  id: 'p-1',
  full_name: 'Avery Nguyen',
  role: 'player' as const,
  team: 'Sea Otters',
  position: 'D',
  jersey_no: 17,
}

const staffRowWithNoExtras = {
  id: 's-9',
  full_name: 'Sam Ortiz',
  role: 'staff' as const,
  team: null,
  position: null,
  jersey_no: null,
}

describe('mapDirectoryPersonRow', () => {
  // The directory page shows displayName/teamName/positionOrTitle/
  // jerseyNumber — hockey ops staff should never see a raw column name
  // or an unexpected shape.
  it('renames directory_people columns to the UI-facing field names', () => {
    expect(mapDirectoryPersonRow(activePlayerRow)).toEqual({
      id: 'p-1',
      displayName: 'Avery Nguyen',
      role: 'player',
      teamName: 'Sea Otters',
      positionOrTitle: 'D',
      jerseyNumber: 17,
    })
  })

  // A staff member with no team/position/jersey number must stay
  // genuinely unknown (null) on the page, not silently become "" or 0 —
  // that would misrepresent their record instead of just omitting a
  // field.
  it('preserves null for missing team/position/jersey number rather than inventing a value', () => {
    expect(mapDirectoryPersonRow(staffRowWithNoExtras)).toEqual({
      id: 's-9',
      displayName: 'Sam Ortiz',
      role: 'staff',
      teamName: null,
      positionOrTitle: null,
      jerseyNumber: null,
    })
  })
})

describe('parseListDirectoryEntriesInput', () => {
  // No filters at all is the common case (opening the directory page
  // fresh) — it must succeed with sane defaults, not reject empty input.
  it('defaults to no search, no role filter, and a limit of 100 when nothing is sent', () => {
    const result = parseListDirectoryEntriesInput({})
    expect(result).toEqual({
      ok: true,
      value: { search: null, role: null, limit: 100 },
    })
  })

  // A search box that only has spaces in it should behave like an empty
  // search, not silently filter out every real person whose name has a
  // space in it.
  it('collapses a whitespace-only search to no filter', () => {
    const result = parseListDirectoryEntriesInput({ search: '   ' })
    expect(result.ok).toBe(true)
    expect(result.ok && result.value.search).toBeNull()
  })

  // Input validation is the safety boundary described in
  // docs/server-function-contract.md — a non-string search must be
  // rejected outright, not coerced or passed through to the query.
  it('rejects a non-string search instead of coercing it', () => {
    const result = parseListDirectoryEntriesInput({ search: 42 })
    expect(result.ok).toBe(false)
  })

  // Only the two roles the directory_people check constraint actually
  // allows may ever reach the query — anything else must be rejected.
  it('accepts "player" and "staff" as the only valid role filters', () => {
    expect(parseListDirectoryEntriesInput({ role: 'player' })).toEqual({
      ok: true,
      value: { search: null, role: 'player', limit: 100 },
    })
    expect(parseListDirectoryEntriesInput({ role: 'staff' })).toEqual({
      ok: true,
      value: { search: null, role: 'staff', limit: 100 },
    })
  })

  it('rejects a role value the table does not support', () => {
    const result = parseListDirectoryEntriesInput({ role: 'coach' })
    expect(result.ok).toBe(false)
  })

  // The contract caps limit at 200 so a caller can never ask this server
  // function to pull an unbounded number of rows.
  it('clamps a limit above 200 down to 200', () => {
    const result = parseListDirectoryEntriesInput({ limit: 500 })
    expect(result.ok).toBe(true)
    expect(result.ok && result.value.limit).toBe(200)
  })

  // A zero or negative limit must not silently become "no rows" or an
  // invalid query — it's floored at the documented minimum of 1.
  it('floors a limit below 1 up to 1', () => {
    const result = parseListDirectoryEntriesInput({ limit: 0 })
    expect(result.ok).toBe(true)
    expect(result.ok && result.value.limit).toBe(1)
  })

  it('rejects a non-numeric limit', () => {
    const result = parseListDirectoryEntriesInput({ limit: 'a lot' })
    expect(result.ok).toBe(false)
  })
})
