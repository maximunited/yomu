-- Additive only: extra family/other DOBs for multi-profile birthday views.
-- Safe on Neon (no drop of legacy User.password).
CREATE TABLE IF NOT EXISTS "additional_birthdays" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "additional_birthdays_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "additional_birthdays_userId_idx" ON "additional_birthdays"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'additional_birthdays_userId_fkey'
  ) THEN
    ALTER TABLE "additional_birthdays"
      ADD CONSTRAINT "additional_birthdays_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
