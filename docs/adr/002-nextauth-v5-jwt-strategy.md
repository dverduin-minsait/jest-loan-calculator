# ADR-002: NextAuth v5 with JWT Strategy (No Database Sessions)

## Status
Accepted

## Context
The app requires authentication with username/password credentials. Options
considered:

1. Custom session table in SQLite
2. NextAuth with database sessions
3. NextAuth with JWT sessions

Database sessions require a `Session` table and an `Account` table plus a cleanup
job for expired rows. For a single-user-per-server SQLite deployment this adds
complexity without benefit.

## Decision
Use **NextAuth v5 (beta)** with the **JWT strategy** and the split-config pattern:

- `src/auth.config.ts` — Edge-compatible config (no Node.js builtins). Used by
  middleware (if added) and as the base config.
- `src/auth.ts` — Full Node.js config used by API routes and Server Components.
  Contains the `Credentials` provider with `bcryptjs` password comparison.

Session data (user id, email, name) is stored in a signed JWT cookie, verified on
every request without a DB roundtrip. The JWT callback stores `user.id` in the
token so `session.user.id` is always available.

`@auth/prisma-adapter` is installed as a dependency but **not used** — it was
included speculatively and should be removed.

## Consequences
**Positive**
- No `Session` table in SQLite; no session cleanup needed
- Session reads are pure crypto (JWT verify) — no DB hit per request
- Edge-compatible config available for `middleware.ts` if needed in future

**Negative**
- Session data cannot be revoked server-side without a token blocklist
- `@auth/prisma-adapter` in `package.json` is dead weight — misleads readers
- Password changes don't invalidate existing sessions (user stays logged in)
- NextAuth v5 is still beta; APIs may change before stable release
