import { prisma } from "../lib/prisma.js";
import { parseTimeToMinutes } from "../schemas/session.schema.js";
import {
  cancelFocusSession,
  completeFocusSession,
  getActiveFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
  FocusSessionError,
} from "../services/focusSession.service.js";

const sessionSelect = {
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
  createdAt: true,
  updatedAt: true,
};

const parseDate = (value) => new Date(`${value}T00:00:00.000Z`);

const findOwnedSubject = (userId, subjectId) =>
  prisma.subject.findFirst({
    where: { id: subjectId, userId },
    select: { id: true },
  });

export const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.user.id },
      select: sessionSelect,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSession = async (req, res) => {
  const { subjectId, topicId, date, ...data } = req.body;
  try {
    if (!(await findOwnedSubject(req.user.id, subjectId))) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const startMins = parseTimeToMinutes(data.startTime);
    const endMins = parseTimeToMinutes(data.endTime);
    if (startMins === null || endMins === null) {
      return res.status(400).json({ error: "Invalid start or end time format" });
    }
    if (endMins === startMins) {
      return res.status(400).json({ error: "End time must be later than start time" });
    }
    if (endMins < startMins) {
      return res.status(400).json({ error: "End time cannot be earlier than start time" });
    }

    const derivedDuration = endMins - startMins;
    if (data.duration !== undefined && data.duration !== derivedDuration) {
      return res.status(400).json({
        error: `Duration (${data.duration}) does not match the difference between start time and end time (${derivedDuration})`,
      });
    }

    const session = await prisma.studySession.create({
      data: {
        ...data,
        duration: derivedDuration,
        date: parseDate(date),
        subjectId,
        topicId: topicId || null,
        userId: req.user.id,
      },
      select: sessionSelect,
    });
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSession = async (req, res) => {
  const { id } = req.params;
  const { subjectId, topicId, date, ...data } = req.body;
  try {
    const existing = await prisma.studySession.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Session not found" });

    if (
      data.status === "completed" &&
      ["in-progress", "paused"].includes(existing.status)
    ) {
      return res.status(409).json({
        error: "Use the Focus Mode completion endpoint for an active session",
      });
    }
    if (
      data.status &&
      data.status !== existing.status &&
      ["completed", "cancelled", "missed"].includes(existing.status)
    ) {
      return res.status(409).json({
        error: `Session cannot transition from ${existing.status} status`,
      });
    }

    if (subjectId && !(await findOwnedSubject(req.user.id, subjectId))) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const nextSubjectId = subjectId || existing.subjectId;
    const nextTopicId = topicId !== undefined ? topicId || null : existing.topicId;
    if (nextTopicId) {
      const topic = await prisma.topic.findFirst({
        where: {
          id: nextTopicId,
          subjectId: nextSubjectId,
          subject: { userId: req.user.id },
        },
        select: { id: true },
      });
      if (!topic) return res.status(404).json({ error: "Topic not found" });
    }

    const nextStartTime = data.startTime ?? existing.startTime;
    const nextEndTime = data.endTime ?? existing.endTime;
    const startMins = parseTimeToMinutes(nextStartTime);
    const endMins = parseTimeToMinutes(nextEndTime);

    if (startMins === null || endMins === null) {
      return res.status(400).json({ error: "Invalid start or end time format" });
    }
    if (endMins === startMins) {
      return res.status(400).json({ error: "End time must be later than start time" });
    }
    if (endMins < startMins) {
      return res.status(400).json({ error: "End time cannot be earlier than start time" });
    }

    const derivedDuration = endMins - startMins;
    if (data.duration !== undefined && data.duration !== derivedDuration) {
      return res.status(400).json({
        error: `Duration (${data.duration}) does not match the difference between start time and end time (${derivedDuration})`,
      });
    }

    data.duration = derivedDuration;

    const manualCompletion =
      data.status === "completed" && existing.status !== "completed";
    const session = await prisma.studySession.update({
      where: { id },
      data: {
        ...data,
        ...(manualCompletion
          ? {
              actualDurationSeconds: null,
              activeStartedAt: null,
              pausedAt: null,
              completedAt: null,
              cancelledAt: null,
            }
          : {}),
        ...(date ? { date: parseDate(date) } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(topicId !== undefined ? { topicId: topicId || null } : {}),
      },
      select: sessionSelect,
    });
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToFocusError = (res, error) => {
  if (error instanceof FocusSessionError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error?.code === "P2025") {
    return res.status(404).json({ error: "Session not found" });
  }
  console.error("Focus session error:", error);
  return res.status(500).json({ error: "Unable to update focus session" });
};

const focusResponse = (res, session) =>
  res.status(200).json({
    session,
    serverTime: new Date().toISOString(),
  });

export const getActiveSession = async (req, res) => {
  try {
    return focusResponse(res, await getActiveFocusSession(req.user.id));
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const startSessionFocus = async (req, res) => {
  try {
    return focusResponse(
      res,
      await startFocusSession(req.params.id, req.user.id),
    );
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const pauseSessionFocus = async (req, res) => {
  try {
    return focusResponse(
      res,
      await pauseFocusSession(req.params.id, req.user.id),
    );
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const resumeSessionFocus = async (req, res) => {
  try {
    return focusResponse(
      res,
      await resumeFocusSession(req.params.id, req.user.id),
    );
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const completeSessionFocus = async (req, res) => {
  try {
    return focusResponse(
      res,
      await completeFocusSession(req.params.id, req.user.id),
    );
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const cancelSessionFocus = async (req, res) => {
  try {
    return focusResponse(
      res,
      await cancelFocusSession(req.params.id, req.user.id),
    );
  } catch (error) {
    return respondToFocusError(res, error);
  }
};

export const deleteSession = async (req, res) => {
  try {
    const existing = await prisma.studySession.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ error: "Session not found" });

    await prisma.studySession.delete({ where: { id: existing.id } });
    res.status(200).json({ id: existing.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
