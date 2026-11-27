/*
  Warnings:

  - The values [MCQ,CONCEPTUAL] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - The `difficulty` column on the `Quiz` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "difficultyLevel" AS ENUM ('easy', 'medium', 'hard', 'adaptive');

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('mcq', 'conceptual');
ALTER TABLE "public"."QuizQuestion" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "QuizQuestion" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
ALTER TABLE "QuizQuestion" ALTER COLUMN "type" SET DEFAULT 'mcq';
COMMIT;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "difficultyLevel" NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "QuizQuestion" ALTER COLUMN "type" SET DEFAULT 'mcq';
