/*
  Warnings:

  - The `feedback` column on the `QuizAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'CONCEPTUAL');

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "feedback",
ADD COLUMN     "feedback" JSONB;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "expectedPoints" TEXT[],
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'MCQ';

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "masteryScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "userResponse" TEXT NOT NULL,
    "correctSolution" TEXT NOT NULL,
    "reason" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MistakeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flashcard_topicId_nextReviewAt_idx" ON "Flashcard"("topicId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "MistakeLog_userId_topicId_resolved_idx" ON "MistakeLog"("userId", "topicId", "resolved");

-- CreateIndex
CREATE INDEX "Quiz_topicId_idx" ON "Quiz"("topicId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_quizId_idx" ON "QuizAttempt"("userId", "quizId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
