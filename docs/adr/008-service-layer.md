# ADR-008: Service Layer Extraction from Route Handlers

## Status
Accepted

## Context
Initially, all business logic (DB queries, ownership checks, password hashing)
lived directly inside Next.js route handlers. This had two problems:

1. **Testability** — route handlers mix HTTP concerns (parsing request, returning
   response) with business logic, requiring full HTTP mocking to test logic.
2. **Reuse** — if a Server Component wanted to call the same logic directly
   (without an HTTP round-trip), it couldn't.

## Decision
Extract business logic into `src/lib/services/`:

- `loans.ts` — `listLoans`, `getLoan`, `createLoan`, `updateLoan`, `deleteLoan`
- `users.ts` — `getUser`, `createUser`, `updateUser`, `deleteUser`
- `service-error.ts` — `ServiceError` class with typed `code` field
  (`NOT_FOUND | FORBIDDEN | CONFLICT`)

Route handlers are reduced to:
1. Parse and validate request (auth check + Zod)
2. Call service function
3. Map `ServiceError` to HTTP status codes via `serviceErrorResponse()`

Service functions are tested in isolation with mocked Prisma (`jest.mock`),
without needing to construct `NextRequest` objects.

## Consequences
**Positive**
- Service functions are pure async functions — easy to unit test
- HTTP concerns (status codes, response format) are isolated in route handlers
- `ServiceError` codes make error mapping explicit and exhaustive
- Route handlers become thin and uniform

**Negative**
- Some pages (`dashboard/page.tsx`, `loans/page.tsx`, `loans/[id]/page.tsx`)
  still import `prisma` directly instead of going through services — the
  architectural intent is not fully realized
- `PUT /api/users/[id]/route.ts` validates password length in the route handler
  rather than delegating entirely to `updateUser` — a leak of business rules
- Double Prisma call on ownership check in services (`findUnique` + `delete`)
  could be reduced to a single `deleteWhere` on Prisma with a compound filter
