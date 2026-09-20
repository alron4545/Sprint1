// The one seam route/component code goes through to get directory data.
//
// Sprint 1: reads the local seed array below (see docs/requirements-brief.md).
// A later sprint (see /tmp/boundary-risk-notes.md's plan) replaces the body
// of these functions with real Supabase-backed queries, behind a TanStack
// Start server function, without changing this file's exported shape or
// any of its callers.

import { seedPlayers, seedGames } from '../data/hockeySeed'
import type { SeedGame, SeedPlayer } from '../data/hockeySeed'

export function listPlayers(): SeedPlayer[] {
  return seedPlayers
}

export function getPlayerById(playerId: string): SeedPlayer | undefined {
  return seedPlayers.find((player) => player.id === playerId)
}

export function listGames(): SeedGame[] {
  return seedGames
}
