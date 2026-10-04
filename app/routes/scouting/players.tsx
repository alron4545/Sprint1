// Routable entry for /scouting/players. The page itself lives at
// src/routes/scouting/players.tsx; this project's router only scans app/routes.
import { createFileRoute } from '@tanstack/react-router'
import { PlayersPage } from '../../../src/routes/scouting/players'

export const Route = createFileRoute('/scouting/players')({
  component: PlayersPage,
})
