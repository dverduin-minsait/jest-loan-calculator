# ADR-010: Jest + React Testing Library

## Status
Accepted

## Context
The project needs a testing strategy that covers:
- Pure calculation logic (`loan-calculations.ts`)
- Service functions (async, Prisma interactions)
- API route handlers (HTTP request/response with mocked dependencies)
- React components (rendering, user interaction)

## Decision
Use **Jest 30** + **React Testing Library (RTL)** for all test layers.

Configuration in `jest.config.ts`:
- `next/jest.js` preset — configures module aliases, SWC transform, and jsdom
- Default environment: `jsdom` for component tests
- `@jest-environment node` docblock override for API route tests (no DOM needed)
- Module name mapper: `@/*` → `<rootDir>/src/*`

Test conventions:
- Files in `src/__tests__/` mirroring source structure
- Mock granularity at the module level: `jest.mock("@/lib/prisma", ...)` and
  `jest.mock("@/auth", ...)` for API tests
- `@testing-library/user-event` for interaction simulation in component tests

**TDD workflow**: analysis issues were addressed test-first (write test → see RED
→ implement → GREEN → commit) throughout the codebase remediation.

## Consequences
**Positive**
- Jest's wide ecosystem; seamless Next.js integration via the preset
- RTL's philosophy (test behavior, not implementation) produces resilient tests
- `@jest-environment node` override allows testing Node.js-only route handlers
  without jsdom overhead

**Negative**
- 15 test suites / 151 tests but significant gaps remain (see analysis):
  no tests for `AvalancheSimulator`, `OptimalAmortizationAdvisor`,
  `AmortizationCalculator`, `RegisterForm`, `Navbar`, `LoanList`, `Toast`
- No integration tests — service tests mock Prisma entirely
- No E2E tests (Playwright / Cypress) — critical user flows are not tested
  against a real browser
- `--forceExit --runInBand` flags required due to open handles from the
  Prisma client warmup and better-sqlite3 in the Node environment
- `aria-modal="true"` on `ConfirmDialog` scopes all `screen.*` queries to the
  modal, requiring `within(dialog)` in tests — a footgun for future test writers
