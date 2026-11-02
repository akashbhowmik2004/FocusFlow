-- AlterTable
ALTER TABLE "StudySession"
ADD COLUMN "activeDurationSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "actualDurationSeconds" INTEGER,
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "activeStartedAt" TIMESTAMP(3),
ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "StudySession_one_active_per_user"
ON "StudySession" ("userId")
WHERE "status" IN ('in-progress', 'paused');
