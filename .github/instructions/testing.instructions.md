---
applyTo: "src/__tests__/**"
---
# Testing Instructions

## Test Structure
Mirror the source tree under `src/__tests__/`:
- `src/__tests__/lib/` for pure functions
- `src/__tests__/components/` for React components  
- `src/__tests__/api/` for route handlers
- `src/__tests__/lib/services/` for service functions

## Environment
- Component tests: default `jsdom` environment (configured in `jest.config.ts`)
- API route tests: add `/** @jest-environment node */` as first comment
- Service tests: add `/** @jest-environment node */` as first comment

## Required Mocks (API and Service Tests)
```ts
jest.mock("@/lib/prisma", () => ({
  prisma: {
    loan: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/rate-limit", () => ({ checkRateLimit: jest.fn().mockReturnValue(true) }));
```
Always declare mocks **before** imports.

## Dialog Testing (ConfirmDialog)
`aria-modal="true"` scopes all `screen.*` queries to inside the modal.
Use `within()` for elements inside the dialog:
```ts
const dialog = screen.getByRole("dialog");
within(dialog).getByRole("button", { name: /delete/i });
```

## What to Test
- Happy path (expected behavior)
- Error paths (network failures, validation errors, forbidden access)
- Edge cases in calculations (zero interest, single-month term, zero extra)
- Accessibility attributes (`role`, `aria-*`) on interactive elements
- That error messages use `role="alert"` and success messages use `role="status"`

## What NOT to Test
- Implementation details (state variable names, internal function calls)
- Tailwind class names
- Exact pixel positions or layout
- Third-party library internals (Recharts rendering)
