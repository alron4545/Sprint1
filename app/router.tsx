import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // One QueryClient per router: on the server getRouter() runs per request, so
  // cached scout data is never shared between visitors. retry: 1 keeps a bad
  // connection or missing .env from sitting on "Loading…" for ~7 seconds.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1 } },
  })

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // Makes the scouting hooks (useQuery / useMutation) work on every page.
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
