import { Link } from '@tanstack/react-router'

const ACTIVE_CLASS =
  'text-sky-700 font-semibold border-b-2 border-sky-600 -mb-px'

export function AppNav() {
  return (
    <nav
      aria-label="Main"
      className="flex flex-wrap gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
    >
      {/* exact: true because every path starts with "/" — without it,
          Home would stay visually "active" on every page. */}
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className="border-b-2 border-transparent pb-1 text-slate-700 hover:text-slate-900"
        activeProps={{ className: `border-b-2 pb-1 ${ACTIVE_CLASS}` }}
      >
        Home
      </Link>
      <Link
        to="/players"
        className="border-b-2 border-transparent pb-1 text-slate-700 hover:text-slate-900"
        activeProps={{ className: `border-b-2 pb-1 ${ACTIVE_CLASS}` }}
      >
        Players
      </Link>
      <Link
        to="/games"
        className="border-b-2 border-transparent pb-1 text-slate-700 hover:text-slate-900"
        activeProps={{ className: `border-b-2 pb-1 ${ACTIVE_CLASS}` }}
      >
        Games
      </Link>
    </nav>
  )
}
