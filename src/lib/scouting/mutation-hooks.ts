// src/lib/scouting/mutation-hooks.ts
//
// TanStack Query mutation hooks over the typed writes in mutations.ts. Each
// hook runs the write and, ONLY on real success, marks the related cached
// reads stale (they refetch if on screen, or on next visit). Keys come from
// the scoutingKeys factory — no string arrays here, and never an
// invalidate-everything call. The full map lives in
// docs/scouting-cache-invalidation-map.md; keep the two in step.
//
// mutations.ts RETURNS { data, error } instead of throwing, and TanStack
// treats any returned value as success — so unwrap() turns { error } into a
// thrown Error. That makes onSuccess fire only for saves that really
// happened, and exposes the readable message as the hook's `error.message`.

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  createScoutingEvent,
  updatePlayerNotes,
  type MutationResult,
  type ScoutingEventInsert,
} from './mutations'
import { scoutingKeys } from './query-keys'

function unwrap<T>(result: MutationResult<T>): T {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export type UpdatePlayerNotesVariables = { playerId: string; notes: string }

// The *MutationOptions builders hold the behavior; the hooks below just bind
// them to React's query client. (Exported so the behavior can be tested
// without rendering React — UI code should use the hooks.)

export function createScoutingEventMutationOptions(queryClient: QueryClient) {
  return {
    mutationFn: async (input: ScoutingEventInsert) =>
      unwrap(await createScoutingEvent(input)),
    // A new event changes every events list (plain and with-details, any
    // filters) and the per-player totals. It does NOT change any player or
    // game row, so those caches are left alone. Returning the promise keeps
    // the mutation "pending" until the affected lists have refetched.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: scoutingKeys.events() }),
        queryClient.invalidateQueries({ queryKey: scoutingKeys.aggregates() }),
      ]),
  }
}

export function updatePlayerNotesMutationOptions(queryClient: QueryClient) {
  return {
    mutationFn: async ({ playerId, notes }: UpdatePlayerNotesVariables) =>
      unwrap(await updatePlayerNotes(playerId, notes)),
    // Notes live on the player row: refresh that player's detail and the
    // player lists (their select('*') includes notes). Event feeds and totals
    // only carry name/position/team, so they stay cached.
    onSuccess: (_data: unknown, variables: UpdatePlayerNotesVariables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: scoutingKeys.playerDetail(variables.playerId) }),
        queryClient.invalidateQueries({ queryKey: scoutingKeys.playerLists() }),
      ]),
  }
}

/** Log a scouting event; refreshes event lists and per-player totals. */
export function useCreateScoutingEvent() {
  const queryClient = useQueryClient()
  return useMutation(createScoutingEventMutationOptions(queryClient))
}

/** Save a player's notes; refreshes that player's detail and the player lists. */
export function useUpdatePlayerNotes() {
  const queryClient = useQueryClient()
  return useMutation(updatePlayerNotesMutationOptions(queryClient))
}
