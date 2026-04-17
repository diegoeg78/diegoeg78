-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" REAL NOT NULL DEFAULT 0,
    "sqft" INTEGER NOT NULL DEFAULT 0,
    "yearBuilt" INTEGER NOT NULL DEFAULT 0,
    "agentNotes" TEXT NOT NULL DEFAULT '',
    "mlsDescription" TEXT NOT NULL DEFAULT '',
    "cmaData" TEXT NOT NULL DEFAULT '[]',
    "cmaSummary" TEXT NOT NULL DEFAULT '',
    "videoScript" TEXT NOT NULL DEFAULT '',
    "fairHousingScan" TEXT NOT NULL DEFAULT '',
    "sellerNotes" TEXT NOT NULL DEFAULT '',
    "coverPhotoB64" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Listing" ("address", "bathrooms", "bedrooms", "city", "cmaData", "cmaSummary", "coverPhotoB64", "createdAt", "fairHousingScan", "id", "mlsDescription", "price", "sellerNotes", "sqft", "state", "updatedAt", "videoScript", "yearBuilt") SELECT "address", "bathrooms", "bedrooms", "city", "cmaData", "cmaSummary", "coverPhotoB64", "createdAt", "fairHousingScan", "id", "mlsDescription", "price", "sellerNotes", "sqft", "state", "updatedAt", "videoScript", "yearBuilt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
