// Routable entry for /scouting. The page lives at src/routes/scouting/index.tsx;
// this project's router only scans app/routes. The loader calls the server
// function, which checks the session before reading anything.
import { createFileRoute } from '@tanstack/react-router'
import { listScoutingNotes } from '../../../src/server/scouting-notes'
import { ScoutingNotesError, ScoutingNotesPage } from '../../../src/routes/scouting/index'

export const Route = createFileRoute('/scouting/')({
  loader: () => listScoutingNotes(),
  component: ScoutingNotesPage,
  errorComponent: ScoutingNotesError,
})
