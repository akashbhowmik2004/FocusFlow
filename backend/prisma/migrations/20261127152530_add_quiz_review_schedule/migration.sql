-- CreateEnum
CREATE TYPE "QuizReviewStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "QuizReviewSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "quizId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "intervalDays" INTEGER NOT NULL,
    "status" "QuizReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizReviewSchedule_userId_status_scheduledAt_idx" ON "QuizReviewSchedule"("userId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "QuizReviewSchedule_topicId_scheduledAt_idx" ON "QuizReviewSchedule"("topicId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "QuizReviewSchedule" ADD CONSTRAINT "QuizReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizReviewSchedule" ADD CONSTRAINT "QuizReviewSchedule_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizReviewSchedule" ADD CONSTRAINT "QuizReviewSchedule_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
