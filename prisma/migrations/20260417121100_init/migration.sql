-- CreateTable
CREATE TABLE "BrandingProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "agentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL DEFAULT '',
    "overlayPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "bgColor" TEXT NOT NULL DEFAULT '#000000',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "opacity" REAL NOT NULL DEFAULT 0.6,
    "fontSize" INTEGER NOT NULL DEFAULT 22,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
