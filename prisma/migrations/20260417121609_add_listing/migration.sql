-- CreateTable
CREATE TABLE "Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" REAL NOT NULL DEFAULT 0,
    "sqft" INTEGER NOT NULL DEFAULT 0,
    "yearBuilt" INTEGER NOT NULL DEFAULT 0,
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
