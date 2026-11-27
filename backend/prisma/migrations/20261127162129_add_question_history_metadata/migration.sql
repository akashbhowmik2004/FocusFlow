-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "conceptTag" TEXT,
ADD COLUMN     "difficulty" "difficultyLevel",
ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "generationSource" TEXT;

-- CreateIndex
CREATE INDEX "QuizQuestion_fingerprint_idx" ON "QuizQuestion"("fingerprint");
