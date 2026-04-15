const D = require('./node_modules/better-sqlite3');
const db = new D('./dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables));

// Also try a direct insert to test the adapter stack
try {
  const { PrismaBetterSqlite3 } = require('./node_modules/@prisma/adapter-better-sqlite3');
  const { PrismaClient } = require('./src/generated/prisma/client.ts');
  console.log('Prisma import ok');
} catch(e) {
  console.error('Prisma import error:', e.message);
}

db.close();
