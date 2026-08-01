-- AlterTable: Benefit verification fields
ALTER TABLE "benefits" ADD COLUMN IF NOT EXISTS "lastChecked" TIMESTAMP(3);
ALTER TABLE "benefits" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Membership reminder preference
ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "remindEnabled" BOOLEAN NOT NULL DEFAULT true;
