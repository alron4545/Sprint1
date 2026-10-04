// Routable entry for /scouting/events. The page itself lives at
// src/routes/scouting/events.tsx; this project's router only scans app/routes.
import { createFileRoute } from '@tanstack/react-router'
import { EventsPage } from '../../../src/routes/scouting/events'

export const Route = createFileRoute('/scouting/events')({
  component: EventsPage,
})
