-- Add official full-terms link for benefits (PDF or club terms page).
ALTER TABLE "benefits" ADD COLUMN IF NOT EXISTS "termsUrl" TEXT;
ALTER TABLE "custom_benefits" ADD COLUMN IF NOT EXISTS "termsUrl" TEXT;
