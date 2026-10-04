// src/lib/scouting/mutations.ts
//
// Typed WRITE helpers for the scouting board: log an event (insert) and
// update a player's notes (update). Payloads use the generated Insert/Update
// shapes from src/types/database.ts, so a wrong column name or a missing
// required field fails at typecheck. Each helper also checks the obvious
// required values at runtime (types can't see an empty string) and returns
// a small { data, error } result with a message a person can act on, instead
// of throwing or failing silently. Reads live in queries.ts; TanStack Query
// wrappers come in a later step.

import { supabase } from '../supabase/client'
import type { TablesInsert, TablesUpdate } from '../../types/database'
import type { PlayerRow, ScoutingEventRow } from './queries'

export type ScoutingEventInsert = TablesInsert<'scouting_events'>
export type PlayerUpdate = TablesUpdate<'players'>

export type MutationResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } }

function fail(message: string): { data: null; error: { message: string } } {
  return { data: null, error: { message } }
}

/** Postgres error codes we can explain in scout terms; anything else keeps Supabase's own message. */
function readableMessage(
  error: { code?: string; message: string },
  fallbacks: { notFound: string; badReference: string },
): string {
  switch (error.code) {
    case 'PGRST116': // .single() matched zero rows
      return fallbacks.notFound
    case '23503': // foreign key violation
      return fallbacks.badReference
    case '23514': // check constraint (e.g. blank event_type)
      return 'One of the values was rejected by a database rule (check that required text is not blank).'
    default:
      return error.message
  }
}

/**
 * Log a scouting event for one player in one game.
 * Required (enforced by the Insert type AND checked here): player_id, game_id, event_type.
 */
export async function createScoutingEvent(
  input: ScoutingEventInsert,
): Promise<MutationResult<ScoutingEventRow>> {
  if (!input.player_id?.trim()) {
    return fail('Choose a player before logging an event.')
  }
  if (!input.game_id?.trim()) {
    return fail('Choose a game before logging an event.')
  }
  if (!input.event_type.trim()) {
    return fail('Event type is required (for example "goal", "hit", or "note").')
  }

  const { data, error } = await supabase
    .from('scouting_events')
    .insert(input)
    .select()
    .single()

  if (error) {
    return fail(
      readableMessage(error, {
        notFound: 'The event was not saved.',
        badReference: 'That player or game no longer exists, so the event was not saved.',
      }),
    )
  }
  return { data, error: null }
}

/**
 * Replace the free-text notes on a player. Blank text clears the notes (stored as null).
 */
export async function updatePlayerNotes(
  playerId: string,
  notes: string,
): Promise<MutationResult<PlayerRow>> {
  if (!playerId.trim()) {
    return fail('Choose a player before saving notes.')
  }

  const patch: PlayerUpdate = { notes: notes.trim() === '' ? null : notes.trim() }

  const { data, error } = await supabase
    .from('players')
    .update(patch)
    .eq('id', playerId)
    .select()
    .single()

  if (error) {
    return fail(
      readableMessage(error, {
        notFound: 'No player was found with that id, so nothing was updated.',
        badReference: 'The notes could not be saved.',
      }),
    )
  }
  return { data, error: null }
}
