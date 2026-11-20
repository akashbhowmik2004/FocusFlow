-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);

-- Backfill existing users who were registered before academic onboarding was added (2026-11-06)
-- or who already have academic data, subjects, or study sessions, marking their onboarding complete.
UPDATE "User"
SET
  "onboardingCompleted" = true,
  "onboardingCompletedAt" = COALESCE("updatedAt", "createdAt")
WHERE
  "onboardingCompleted" = true
  OR "createdAt" < '2026-11-06 04:24:39'
  OR "institution" IS NOT NULL
  OR "degree" IS NOT NULL
  OR (SELECT COUNT(*) FROM "Subject" WHERE "Subject"."userId" = "User"."id") > 0
  OR (SELECT COUNT(*) FROM "StudySession" WHERE "StudySession"."userId" = "User"."id") > 0;
