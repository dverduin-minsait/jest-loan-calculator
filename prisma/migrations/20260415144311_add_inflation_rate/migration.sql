-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "interest" REAL NOT NULL,
    "inflationRate" REAL NOT NULL DEFAULT 0,
    "partialAmortRate" REAL NOT NULL DEFAULT 0,
    "totalAmortRate" REAL NOT NULL DEFAULT 0,
    "months" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "createdAt", "id", "interest", "months", "name", "partialAmortRate", "totalAmortRate", "updatedAt", "userId") SELECT "amount", "createdAt", "id", "interest", "months", "name", "partialAmortRate", "totalAmortRate", "updatedAt", "userId" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
