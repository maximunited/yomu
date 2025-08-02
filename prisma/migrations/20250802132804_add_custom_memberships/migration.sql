-- CreateTable
CREATE TABLE "custom_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '/images/brands/restaurant.svg',
    "type" TEXT NOT NULL DEFAULT 'free',
    "cost" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "custom_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "custom_benefits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customMembershipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "termsAndConditions" TEXT,
    "redemptionMethod" TEXT NOT NULL,
    "promoCode" TEXT,
    "url" TEXT,
    "validityType" TEXT NOT NULL,
    "validityDuration" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "custom_benefits_customMembershipId_fkey" FOREIGN KEY ("customMembershipId") REFERENCES "custom_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "brandId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customMembershipId" TEXT,
    CONSTRAINT "user_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_memberships_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_memberships_customMembershipId_fkey" FOREIGN KEY ("customMembershipId") REFERENCES "custom_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_memberships" ("brandId", "id", "isActive", "joinedAt", "updatedAt", "userId") SELECT "brandId", "id", "isActive", "joinedAt", "updatedAt", "userId" FROM "user_memberships";
DROP TABLE "user_memberships";
ALTER TABLE "new_user_memberships" RENAME TO "user_memberships";
CREATE UNIQUE INDEX "user_memberships_userId_brandId_key" ON "user_memberships"("userId", "brandId");
CREATE UNIQUE INDEX "user_memberships_userId_customMembershipId_key" ON "user_memberships"("userId", "customMembershipId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
