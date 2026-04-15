# ADR-003: SQLite + Prisma 7 + better-sqlite3 Driver Adapter

## Status
Accepted

## Context
A relational database is needed for users and loans. Options considered:

1. PostgreSQL (hosted or local)
2. MySQL / MariaDB
3. SQLite (file-based)

The application targets a single-user self-hosted deployment (study/personal
project). External database services add operational complexity and cost.

## Decision
Use **SQLite** as the sole data store, accessed through:

- **Prisma 7** — ORM and schema management. Prisma 7 uses `prisma-client` as the
  generator name (breaking change from v6) and generates the client to
  `src/generated/prisma/` (not the default `node_modules`).
- **better-sqlite3** — Synchronous Node.js SQLite driver chosen for its
  performance and reliability over `sqlite3` (async with callback-hell).
- **`@prisma/adapter-better-sqlite3`** — Driver adapter required by Prisma 7's
  new driver-adapter architecture. As of 7.7.0, the adapter takes a config object
  `{ url: "file:path" }` rather than a live `Database` instance.

**WAL mode** is enabled at startup via a brief open/close with `better-sqlite3`
directly (`db.pragma("journal_mode = WAL")`), before the Prisma adapter connection
is established. WAL is a file-level persistent setting so the Prisma-managed
connection inherits it.

The global singleton pattern (`globalForPrisma.prisma`) prevents multiple
`PrismaClient` instances during Next.js hot-reloads in development.

## Consequences
**Positive**
- Zero infrastructure — a single `dev.db` file is the entire database
- `better-sqlite3` is the fastest SQLite Node.js driver
- WAL mode allows concurrent reads with writes — suitable for multi-request Next.js

**Negative**
- Not suitable for multi-server deployment (no shared file system)
- SQLite has limited concurrent write throughput compared to PostgreSQL
- `prisma generate` must be re-run after schema changes; generated files are
  committed to the repo (`src/generated/prisma/` is NOT in `.gitignore`)
- Prisma 7 breaking changes (generator name, adapter API) require vigilance on upgrades
