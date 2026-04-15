# ADR-001: Next.js App Router with Route Groups

## Status
Accepted

## Context
The application needs two distinct layouts: one for unauthenticated pages (login,
register — centered, minimal) and one for the authenticated dashboard (sidebar nav,
full-width content area). It also needs a root redirect from `/` to either `/dashboard`
or `/login` depending on session state.

## Decision
Use **Next.js 16 App Router** with route groups to achieve clean layout isolation
without affecting the URL structure:

- `(auth)/` — login and register pages; shares a centered card layout  
- `(dashboard)/` — all authenticated routes; shares the navbar + main wrapper  
- `/` (`src/app/page.tsx`) — server-side redirect leaf, no UI

Route-group layouts call `auth()` to enforce authentication at the layout level
rather than duplicating checks in every page. API routes under `src/app/api/` also
check `auth()` individually so they are protected independently of the layout tree.

## Consequences
**Positive**
- Clean layout isolation without URL pollution (`/dashboard` not `/app/dashboard`)
- Server-side auth check in layout = one place to change redirect behavior
- Incremental rendering via React Server Components where possible

**Negative**
- `auth()` is called twice for every dashboard page (once in layout, once in page
  to access session.user.id for DB queries). Minor double JWT verification cost.
- Layout-level auth guards only protect *page* routes. API routes need independent
  session checks (which they have, but `middleware.ts` doesn't exist, so there is no
  Edge-level route guard).
