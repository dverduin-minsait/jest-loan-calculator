# GitHub Copilot Instructions — jest-loan-calculator

## Project Overview
A Next.js 16 (App Router) personal loan management and analysis tool.
Users track multiple loans, view amortization schedules, and receive
debt-payoff advice using the avalanche method.

## Tech Stack
- **Framework**: Next.js 16.2.3 with App Router, TypeScript, Turbopack
- **Auth**: NextAuth v5 (beta.31), JWT strategy, Credentials provider
- **Database**: SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Charts**: Recharts
- **Validation**: Zod 4
- **Testing**: Jest 30 + React Testing Library

## Architecture
```
src/
  app/
    (auth)/          # Login and register pages (unauthenticated)
    (dashboard)/     # All authenticated routes
    api/             # REST API routes
  components/
    auth/            # Login / Register forms
    dashboard/       # Charts, advisors, calculators, panels
    loans/           # LoanCard, LoanForm, LoanList
    ui/              # Shared UI primitives
  lib/
    loan-calculations.ts  # Pure math — amortization, avalanche, chart data
    prisma.ts             # Prisma singleton with WAL mode
    rate-limit.ts         # In-memory sliding-window rate limiter
    schemas.ts            # Zod schemas for API validation
    services/             # Business logic (loans, users)
  types/             # Shared TypeScript interfaces
  generated/prisma/  # Prisma-generated client (committed to repo)
```

## Critical Conventions

### Testing
- Run tests: `node "C:\Users\dverduin\AppData\Roaming\nvm\v24.14.1\node_modules\npm\bin\npm-cli.js" test -- --no-coverage --forceExit --runInBand`
- Always use `--forceExit --runInBand` — open handles from Prisma/SQLite cause hangs
- API tests require `@jest-environment node` docblock
- When using `ConfirmDialog` in tests, `aria-modal="true"` scopes `screen.*` queries
  to inside the modal — use `within(dialog).getByRole(...)` for buttons inside dialogs
- Mock `@/lib/prisma`, `@/auth`, and `@/lib/rate-limit` in API tests

### Database / Prisma
- After changing `prisma/schema.prisma`, run `npx prisma generate` to refresh
  `src/generated/prisma/`
- The generated client is committed — do NOT add `src/generated/` to `.gitignore`
- `DATABASE_URL` must be a `file:./relative/path` format
- Do NOT commit `dev.db`, `dev.db-wal`, `dev.db-shm` — covered by `.gitignore`

### Auth
- `src/auth.config.ts` = Edge-compatible (no Node.js builtins), used as base config
- `src/auth.ts` = Full Node.js config with Credentials provider and bcrypt
- Never add `better-sqlite3`, `bcryptjs`, or `prisma` imports to `auth.config.ts`
- `@auth/prisma-adapter` is installed but NOT used — ignore it

### API Routes
- All routes validate input with Zod (`LoanCreateSchema`, `UserCreateSchema`, etc.)
- All mutating routes call `auth()` and check `session?.user?.id`
- Business logic lives in `src/lib/services/` — route handlers should be thin
- `ServiceError` codes map to HTTP: `NOT_FOUND → 404`, `FORBIDDEN → 403`,
  `CONFLICT → 409`
- DELETE returns 204 (no body), not 200

### Components
- Client components are marked `"use client"` at the top
- Server components fetch data directly (no `useEffect` + fetch)
- Expensive calculations (`generateAmortizationSchedule`, `generateChartData`)
  must be memoized with `useMemo` when called from client components
- `ConfirmDialog` uses `role="dialog" aria-modal="true"` — must have `aria-labelledby`

### Style Guide
- Use existing utility class patterns (see other components)
- No inline styles, no CSS modules
- Form inputs use the `.rounded-lg border px-3 py-2 text-sm ...` pattern
- Error messages use `role="alert"` for screen reader announcements
- Success feedback uses `role="status"` (with `aria-live="polite"`)

## Known Issues / TODOs
- `totalAmortRate` field is stored in DB but has NO effect on calculations
- `middleware.ts` does not exist — auth.config.ts comment is misleading
- Several dashboard pages import `prisma` directly instead of using services
- `@auth/prisma-adapter` is an unused dependency
- No E2E tests
- `animate-fade-in` in `Toast.tsx` has no CSS definition
