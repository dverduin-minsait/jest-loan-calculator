# ADR-007: Zod for API Input Validation

## Status
Accepted

## Context
API routes previously used manual `if (!name || amount == null)` checks.
This approach:
- Scattered validation logic across multiple routes
- Gave inconsistent error messages
- Didn't strip unexpected fields from request bodies
- Was fragile to maintain as the schema evolved

## Decision
Use **Zod** for centralized schema validation in `src/lib/schemas.ts`:

- `LoanCreateSchema` — validates all required fields and their constraints
- `LoanUpdateSchema` — `LoanCreateSchema.partial()` for PATCH-style PUT updates
- `UserCreateSchema` — email, name, password with email format and min-length

API routes call `schema.safeParse(body)` and return 400 with the first Zod
error message if parsing fails. On success, the typed `parsed.data` is passed
directly to service functions, eliminating the need for manual casts.

Zod was already transitively present (via `eslint-plugin-react-hooks` → 
`zod-validation-error`), so the direct `zod` dependency adds negligible bundle
overhead.

## Consequences
**Positive**
- Single source of truth for field constraints (min/max lengths, value bounds)
- Type-safe parsed data flows from route → service → Prisma
- `LoanUpdateSchema = LoanCreateSchema.partial()` is DRY — constraints are
  not duplicated for create vs. update
- Zod's error messages are user-readable out of the box

**Negative**
- Zod 4 was a major version bump — `z.string().email()` and other validators
  have subtle behavior changes from v3
- Only the first Zod error issue is returned (`issues[0].message`); multi-field
  forms may confuse users who submit multiple bad fields at once
- Client-side validation in `LoanForm.tsx` is still manual JS — it doesn't reuse
  `LoanCreateSchema`, which means constraints can drift between client and server
