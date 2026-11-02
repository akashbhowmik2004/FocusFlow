-- CreateEnum
CREATE TYPE "RecallRating" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateEnum
CREATE TYPE "RevisionScheduleType" AS ENUM ('SPACED', 'MANUAL');

-- CreateEnum
CREATE TYPE "RevisionSource" AS ENUM ('RECALL_ASSESSMENT', 'QUICK_MARK');

-- CreateTable
CREATE TABLE "TopicRevision" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "rating" "RecallRating",
    "source" "RevisionSource" NOT NULL DEFAULT 'RECALL_ASSESSMENT',
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousInterval" INTEGER NOT NULL DEFAULT 0,
    "intervalAfter" INTEGER NOT NULL DEFAULT 0,
    "repetitionsAfter" INTEGER NOT NULL DEFAULT 0,
    "easeFactorAfter" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "nextRevisionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopicRevision_topicId_reviewedAt_idx" ON "TopicRevision"("topicId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "TopicRevision" ADD CONSTRAINT "TopicRevision_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
