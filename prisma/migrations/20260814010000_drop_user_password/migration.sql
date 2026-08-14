-- Legacy NextAuth column; auth is Clerk-only. Safe to drop (no app reads User.password).
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
