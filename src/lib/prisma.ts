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

  const db = new Database(dbPath);
  // Enable WAL mode: allows concurrent reads alongside writes, improving
  // throughput under the multi-request Next.js server process.
  db.pragma("journal_mode = WAL");

  const adapter = new PrismaBetterSqlite3(db);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
