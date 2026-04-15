import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

function createPrismaClient(): PrismaClient {
  // Resolve the SQLite file path from the DATABASE_URL env var
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbPath = dbUrl.startsWith("file:")
    ? path.resolve(process.cwd(), dbUrl.slice("file:".length))
    : dbUrl;

  // Enable WAL mode once (it's a persistent file-level setting).
  // We open briefly to run the pragma, then close so the adapter gets its own
  // connection via the new config-based factory API introduced in Prisma 7.7.0.
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.close();

  // Prisma 7.7.0: PrismaBetterSqlite3 is now a factory that takes { url } and
  // creates the connection internally (previously accepted a Database instance).
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
