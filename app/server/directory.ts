// Re-exports the directory server functions from directoryLoader.ts.
//
// This file exists at this exact path because the Sprint 2 Topic 1
// assignment materials and the automated commit checker both refer to
// app/server/directory.ts as the module implementing listDirectoryEntries.
// The actual implementation lives in directoryLoader.ts (alongside the
// pre-existing Sprint 1 listPlayers/getPlayerById/listGames functions,
// which app/routes/players/index.tsx still calls directly) — this file is
// a thin, logic-free re-export so that path also resolves to the same
// exports, rather than duplicating any code.
export * from './directoryLoader'
