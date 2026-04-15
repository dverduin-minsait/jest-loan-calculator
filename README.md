# LoanCalc

A personal loan management and analysis tool built with Next.js 16. Track multiple
loans, visualise amortisation schedules, and get actionable debt-payoff advice
using the avalanche method.

---

## Features

| Category | What it does |
|---|---|
| **Loan CRUD** | Create, edit, and delete loans with name, principal, interest rate, term, and partial-amortisation rate |
| **Debt chart** | Interactive line chart showing balance and cumulative-paid curves per loan, plus totals |
| **Amortisation calculator** | Apply a one-off extra payment at any month and see how much sooner the loan ends |
| **Optimal advisor** | Ranks all your loans by interest saved for a given lump-sum (avalanche method) |
| **Monthly avalanche simulator** | Simulates directing a fixed monthly extra toward your highest-rate debt; shows total interest saved, months saved, and payoff order |
| **Loan cost summary** | Shows total principal, total you will pay, and total interest cost across all loans |
| **Savings & income panel** | Track monthly income and savings alongside your debt |
| **Pagination** | Loans list paginates at 10 per page |
| **Authentication** | Email/password auth with JWT sessions (NextAuth v5) |
| **Rate limiting** | 5 registration attempts per IP per 15 min; 10 login attempts per email per 15 min |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Auth | NextAuth v5 beta, JWT strategy |
| Database | SQLite (WAL mode) via Prisma 7 + better-sqlite3 |
| Validation | Zod 4 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Testing | Jest 30 + React Testing Library |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env` to `.env.local` and fill in the required values:

```bash
cp .env .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite file path, e.g. `file:./dev.db` |
| `AUTH_SECRET` | ✅ | Random string for JWT signing (32+ chars). Generate with `openssl rand -hex 32` |
| `NEXTAUTH_URL` | ✅ in prod | Full base URL, e.g. `http://localhost:3000` |

### 3. Create the database

```bash
npx prisma migrate dev --name init
```

Or if you just want the schema without migration history:

```bash
npx prisma db push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to
`/login`. Register a new account to get started.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run all tests (use `-- --no-coverage --forceExit --runInBand` for reliability) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint |

> **Note on test flags**: always pass `--forceExit --runInBand` to avoid Jest
> hangs caused by open Prisma / SQLite handles in the test environment.

---

## Project Structure

```
jest-loan-calculator/
├── docs/
│   └── adr/                   # Architecture Decision Records (10 ADRs)
├── prisma/
│   └── schema.prisma          # Database schema (User, Loan models)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Unauthenticated pages (login, register)
│   │   ├── (dashboard)/       # Authenticated pages (dashboard, loans)
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── auth/              # LoginForm, RegisterForm
│   │   ├── dashboard/         # DebtChart, AmortizationCalculator,
│   │   │                      #   OptimalAmortizationAdvisor,
│   │   │                      #   AvalancheSimulator, LoanSummaryCard,
│   │   │                      #   SavingsIncomePanel
│   │   ├── loans/             # LoanCard, LoanForm, LoanList
│   │   └── ui/                # ConfirmDialog, ErrorBoundary, Navbar,
│   │                          #   PaginationBar, Toast
│   ├── lib/
│   │   ├── loan-calculations.ts   # Pure math: amortisation + avalanche
│   │   ├── prisma.ts              # Prisma singleton (WAL mode)
│   │   ├── rate-limit.ts          # In-memory sliding-window limiter
│   │   ├── schemas.ts             # Zod validation schemas
│   │   └── services/              # Business logic layer
│   │       ├── loans.ts
│   │       ├── users.ts
│   │       └── service-error.ts
│   ├── types/                 # Shared TypeScript types
│   └── __tests__/             # Tests mirroring src/ structure
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/          # Scoped coding instructions
│   ├── workflows/             # CI/CD GitHub Actions
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
└── prisma.config.ts           # Prisma CLI config (datasource + migrations)
```

---

## API Reference

All endpoints require authentication (valid JWT session cookie) except
`POST /api/users` (registration) and the NextAuth routes.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/loans` | List authenticated user's loans |
| `POST` | `/api/loans` | Create a loan |
| `GET` | `/api/loans/:id` | Get a single loan |
| `PUT` | `/api/loans/:id` | Update a loan |
| `DELETE` | `/api/loans/:id` | Delete a loan (204) |
| `POST` | `/api/users` | Register (rate-limited: 5 req / 15 min per IP) |
| `GET` | `/api/users/:id` | Get own profile |
| `PUT` | `/api/users/:id` | Update own profile |
| `DELETE` | `/api/users/:id` | Delete own account (204) |

### Loan fields

| Field | Type | Constraints |
|---|---|---|
| `name` | string | 1–255 chars |
| `amount` | number | ≥ 0 |
| `interest` | number | ≥ 0 (annual %) |
| `months` | integer | ≥ 1 |
| `partialAmortRate` | number | ≥ 0 (annual % of balance, default 0) |
| `totalAmortRate` | number | ≥ 0 (stored, no effect on calculations yet) |

---

## Architecture Decisions

Key decisions are documented as Architecture Decision Records in [`docs/adr/`](docs/adr/):

| ADR | Decision |
|---|---|
| [001](docs/adr/001-nextjs-app-router-route-groups.md) | Next.js App Router with route groups |
| [002](docs/adr/002-nextauth-v5-jwt-strategy.md) | NextAuth v5 with JWT strategy |
| [003](docs/adr/003-sqlite-prisma-better-sqlite3.md) | SQLite + Prisma 7 + better-sqlite3 |
| [004](docs/adr/004-french-amortization-model.md) | French amortisation model |
| [005](docs/adr/005-avalanche-debt-payoff.md) | Avalanche method for debt payoff |
| [006](docs/adr/006-in-memory-rate-limiting.md) | In-memory sliding-window rate limiter |
| [007](docs/adr/007-zod-api-validation.md) | Zod for API input validation |
| [008](docs/adr/008-service-layer.md) | Service layer extraction |
| [009](docs/adr/009-tailwind-css-v4.md) | Tailwind CSS v4 |
| [010](docs/adr/010-jest-rtl-testing.md) | Jest + React Testing Library |

---

## Known Limitations

- `totalAmortRate` field is stored in the database and shown in the UI but has
  **no effect on any calculation**. It is reserved for a future "prepayment
  penalty cap" feature.
- The rate limiter is **in-memory only** — counters reset on server restart.
  Not suitable for multi-instance deployments.
- `@auth/prisma-adapter` is listed as a dependency but is not used.
- No E2E tests (Playwright / Cypress).
- No middleware.ts — route protection is at layout level, not edge level.
- All amounts are displayed in EUR; there is no currency field on loans.
- No loan start date — all calculations assume month 1 = today.

---

## Analysis

A full analysis of issues found in the codebase (security, logic, architecture,
performance, accessibility, UX, and business logic) is documented in
[`analysis.md`](analysis.md).

---

## License

Private / educational project.

