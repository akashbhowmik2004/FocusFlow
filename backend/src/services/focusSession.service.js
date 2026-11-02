import { prisma } from "../lib/prisma.js";

export const focusSessionSelect = {
  id: true,
  title: true,
  date: true,
  startTime: true,
  endTime: true,
  duration: true,
  status: true,
  activeDurationSeconds: true,
  actualDurationSeconds: true,
  startedAt: true,
  activeStartedAt: true,
  pausedAt: true,
  completedAt: true,
  cancelledAt: true,
  subjectId: true,
  topicId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
};

export class FocusSessionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function calculateActiveDurationSeconds(session, now = new Date()) {
  const accumulated = Number(session.activeDurationSeconds || 0);
  if (!session.activeStartedAt) return accumulated;

  const elapsed = Math.floor(
    (now.getTime() - new Date(session.activeStartedAt).getTime()) / 1000,
  );
  return accumulated + Math.max(0, elapsed);
}

async function lockOwnedSession(tx, id, userId) {
  await tx.$queryRaw`
    SELECT "id"
    FROM "StudySession"
    WHERE "id" = ${id} AND "userId" = ${userId}
    FOR UPDATE
  `;

  return tx.studySession.findFirst({
    where: { id, userId },
    select: focusSessionSelect,
  });
}

async function assertSessionAssociations(tx, session) {
  const subject = await tx.subject.findFirst({
    where: { id: session.subjectId, userId: session.userId },
    select: { id: true },
  });
  if (!subject) {
    throw new FocusSessionError(404, "Subject not found");
  }

  if (session.topicId) {
    const topic = await tx.topic.findFirst({
      where: {
        id: session.topicId,
        subjectId: session.subjectId,
        subject: { userId: session.userId },
      },
      select: { id: true },
    });
    if (!topic) {
      throw new FocusSessionError(404, "Topic not found");
    }
  }
}

async function withLockedSession(id, userId, operation) {
  return prisma.$transaction(async (tx) => {
    const session = await lockOwnedSession(tx, id, userId);
    if (!session) {
      throw new FocusSessionError(404, "Session not found");
    }
    await assertSessionAssociations(tx, session);
    return operation(tx, session);
  });
}

export async function getActiveFocusSession(userId) {
  return prisma.studySession.findFirst({
    where: {
      userId,
      status: { in: ["in-progress", "paused"] },
    },
    orderBy: { startedAt: "asc" },
    select: focusSessionSelect,
  });
}

export async function startFocusSession(id, userId) {
  const now = new Date();
  try {
    return await withLockedSession(id, userId, async (tx, session) => {
      if (session.status !== "upcoming") {
        throw new FocusSessionError(
          409,
          `Session cannot start from ${session.status} status`,
        );
      }

      const activeSession = await tx.studySession.findFirst({
        where: {
          userId,
          status: { in: ["in-progress", "paused"] },
        },
        select: { id: true },
      });
      if (activeSession) {
        throw new FocusSessionError(409, "Another study session is already active");
      }

      return tx.studySession.update({
        where: { id: session.id },
        data: {
          status: "in-progress",
          activeDurationSeconds: 0,
          actualDurationSeconds: null,
          startedAt: now,
          activeStartedAt: now,
          pausedAt: null,
          completedAt: null,
          cancelledAt: null,
        },
        select: focusSessionSelect,
      });
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new FocusSessionError(409, "Another study session is already active");
    }
    throw error;
  }
}

export async function pauseFocusSession(id, userId) {
  const now = new Date();
  return withLockedSession(id, userId, async (tx, session) => {
    if (session.status !== "in-progress") {
      throw new FocusSessionError(
        409,
        `Session cannot pause from ${session.status} status`,
      );
    }

    return tx.studySession.update({
      where: { id: session.id },
      data: {
        status: "paused",
        activeDurationSeconds: calculateActiveDurationSeconds(session, now),
        activeStartedAt: null,
        pausedAt: now,
      },
      select: focusSessionSelect,
    });
  });
}

export async function resumeFocusSession(id, userId) {
  const now = new Date();
  return withLockedSession(id, userId, async (tx, session) => {
    if (session.status !== "paused") {
      throw new FocusSessionError(
        409,
        `Session cannot resume from ${session.status} status`,
      );
    }

    return tx.studySession.update({
      where: { id: session.id },
      data: {
        status: "in-progress",
        activeStartedAt: now,
        pausedAt: null,
      },
      select: focusSessionSelect,
    });
  });
}

export async function completeFocusSession(id, userId) {
  const now = new Date();
  return withLockedSession(id, userId, async (tx, session) => {
    if (session.status === "completed") return session;
    if (!["in-progress", "paused"].includes(session.status)) {
      throw new FocusSessionError(
        409,
        `Session cannot complete from ${session.status} status`,
      );
    }

    const actualDurationSeconds = calculateActiveDurationSeconds(session, now);
    return tx.studySession.update({
      where: { id: session.id },
      data: {
        status: "completed",
        activeDurationSeconds: actualDurationSeconds,
        actualDurationSeconds,
        activeStartedAt: null,
        pausedAt: null,
        completedAt: now,
      },
      select: focusSessionSelect,
    });
  });
}

export async function cancelFocusSession(id, userId) {
  const now = new Date();
  return withLockedSession(id, userId, async (tx, session) => {
    if (!["upcoming", "in-progress", "paused"].includes(session.status)) {
      throw new FocusSessionError(
        409,
        `Session cannot cancel from ${session.status} status`,
      );
    }

    const hasStarted = Boolean(session.startedAt);
    const activeDurationSeconds = hasStarted
      ? calculateActiveDurationSeconds(session, now)
      : 0;

    return tx.studySession.update({
      where: { id: session.id },
      data: {
        status: "cancelled",
        activeDurationSeconds,
        actualDurationSeconds: hasStarted ? activeDurationSeconds : null,
        activeStartedAt: null,
        pausedAt: null,
        cancelledAt: now,
      },
      select: focusSessionSelect,
    });
  });
}
