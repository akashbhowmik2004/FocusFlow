-- CreateEnum
CREATE TYPE "AIFeature" AS ENUM ('TOPIC_VALIDATION', 'QUIZ_GENERATION', 'CONCEPTUAL_EVALUATION', 'FLASHCARD_GENERATION');

-- CreateEnum
CREATE TYPE "AIRequestStatus" AS ENUM ('RESERVED', 'SUCCEEDED', 'FAILED', 'RELEASED', 'CACHED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "AIUsageCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "AIFeature" NOT NULL,
    "dateKey" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "reservedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIUsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "AIFeature" NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "tokensEstimated" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "AIRequestStatus" NOT NULL,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIQuotaConfig" (
    "feature" "AIFeature" NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIQuotaConfig_pkey" PRIMARY KEY ("feature")
);

-- CreateTable
CREATE TABLE "AIResponseCache" (
    "cacheKey" TEXT NOT NULL,
    "feature" "AIFeature" NOT NULL,
    "scopeUserId" TEXT,
    "payload" JSONB NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResponseCache_pkey" PRIMARY KEY ("cacheKey")
);

-- CreateIndex
CREATE INDEX "AIUsageCounter_dateKey_idx" ON "AIUsageCounter"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageCounter_userId_feature_dateKey_key" ON "AIUsageCounter"("userId", "feature", "dateKey");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_createdAt_idx" ON "AIUsageLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_feature_createdAt_idx" ON "AIUsageLog"("userId", "feature", "createdAt");

-- CreateIndex
CREATE INDEX "AIResponseCache_feature_expiresAt_idx" ON "AIResponseCache"("feature", "expiresAt");

-- CreateIndex
CREATE INDEX "AIResponseCache_scopeUserId_idx" ON "AIResponseCache"("scopeUserId");

-- AddForeignKey
ALTER TABLE "AIUsageCounter" ADD CONSTRAINT "AIUsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
