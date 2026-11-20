-- CreateIndex
CREATE INDEX "StudySession_userId_status_date_idx" ON "StudySession"("userId", "status", "date");

-- CreateIndex
CREATE INDEX "Topic_nextRevision_idx" ON "Topic"("nextRevision");
