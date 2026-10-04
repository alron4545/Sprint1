// Routable entry for /scouting/aggregates. The page itself lives at
// src/routes/scouting/aggregates.tsx; this project's router only scans app/routes.
import { createFileRoute } from '@tanstack/react-router'
import { AggregatesPage } from '../../../src/routes/scouting/aggregates'

export const Route = createFileRoute('/scouting/aggregates')({
  component: AggregatesPage,
})
