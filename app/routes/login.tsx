// Routable entry for /login. The page itself lives at src/routes/login.tsx;
// this project's router only scans app/routes.
import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '../../src/routes/login'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
