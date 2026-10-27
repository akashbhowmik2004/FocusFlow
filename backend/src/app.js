import { prisma } from "./lib/prisma.js";
import express from "express";
const app = express();
app.use(express.json());
app.get("/api/db-check", async (req, res) => {
  try {
    const users = await prisma.user.count();

    res.status(200).json({
      status: "ok",
      message: "Database connection successful",
      userCount: users,
    });
  } catch (error) {
    console.error("Database check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.post("/api/subjects", async (req, res) => {
  try {
    const { name, code, color } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Subject name is required",
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code,
        color,
        userId: "cmvq8aeuv0000o0mq29uy6ipp",
      },
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject failed:", error);

    return res.status(500).json({
      message: "Failed to create subject",
    });
  }
});

app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        userId: "cmvq8aeuv0000o0mq29uy6ipp",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error("Fetch subjects failed:", error);

    return res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }
});

app.get("/api/subjects/:id", async (req, res) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: req.params.id,
        userId: "cmvq8aeuv0000o0mq29uy6ipp",
      },
      include: {
        topics: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    return res.status(200).json({ subject });
  } catch (error) {
    console.error("Fetch subject failed:", error);

    return res.status(500).json({
      message: "Failed to fetch subject",
    });
  }
});

app.put("/api/subjects/:id", async (req, res) => {
  try {
    const { name, code, color } = req.body ?? {};

    // Check that the subject exists and belongs to our development user
    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: req.params.id,
        userId: "cmvq8aeuv0000o0mq29uy6ipp",
      },
    });

    if (!existingSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id: existingSubject.id,
      },
      data: {
        ...(typeof name === "string" && name.trim()
          ? { name: name.trim() }
          : {}),
        ...(typeof code === "string" ? { code: code.trim() || null } : {}),
        ...(typeof color === "string" && color.trim()
          ? { color: color.trim() }
          : {}),
      },
    });

    return res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject failed:", error);

    return res.status(500).json({
      message: "Failed to update subject",
    });
  }
});

app.delete("/api/subjects/:id", async (req, res) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: req.params.id,
        userId: "cmvq8aeuv0000o0mq29uy6ipp",
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    await prisma.subject.delete({
      where: { id: subject.id },
    });

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject failed:", error);

    return res.status(500).json({
      message: "Failed to delete subject",
    });
  }
});

const DEV_USER_ID = "cmvq8aeuv0000o0mq29uy6ipp";

const TOPIC_STATUSES = ["not-started", "in-progress", "completed"];

// ==================== SUBJECTS ====================

// POST: Create subject
app.post("/api/subjects", async (req, res) => {
  try {
    const { name, code, color, colorBg, examDate } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    if (color !== undefined && typeof color !== "string") {
      return res.status(400).json({ message: "Color must be a string" });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        ...(typeof code === "string" ? { code: code.trim() || null } : {}),
        ...(typeof color === "string" && color.trim()
          ? { color: color.trim() }
          : {}),
        ...(typeof colorBg === "string"
          ? { colorBg: colorBg.trim() || null }
          : {}),
        ...(examDate !== undefined
          ? { examDate: examDate ? new Date(examDate) : null }
          : {}),
        userId: DEV_USER_ID,
      },
    });

    return res
      .status(201)
      .json({ message: "Subject created successfully", subject });
  } catch (error) {
    console.error("Create subject failed:", error);
    return res.status(500).json({ message: "Failed to create subject" });
  }
});

// GET: List subjects
app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: DEV_USER_ID },
      include: { _count: { select: { topics: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error("Fetch subjects failed:", error);
    return res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// GET: One subject with its topics
app.get("/api/subjects/:id", async (req, res) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: req.params.id, userId: DEV_USER_ID },
      include: { topics: true },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json({ subject });
  } catch (error) {
    console.error("Fetch subject failed:", error);
    return res.status(500).json({ message: "Failed to fetch subject" });
  }
});

// PUT: Update subject
app.put("/api/subjects/:id", async (req, res) => {
  try {
    const { name, code, color, colorBg, examDate } = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ message: "Subject name cannot be empty" });
    }

    const existing = await prisma.subject.findFirst({
      where: { id: req.params.id, userId: DEV_USER_ID },
    });

    if (!existing) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (color !== undefined && typeof color !== "string") {
      return res.status(400).json({ message: "Color must be a string" });
    }

    const subject = await prisma.subject.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(typeof code === "string" ? { code: code.trim() || null } : {}),
        ...(typeof color === "string" && color.trim()
          ? { color: color.trim() }
          : {}),
        ...(typeof colorBg === "string"
          ? { colorBg: colorBg.trim() || null }
          : {}),
        ...(examDate !== undefined
          ? { examDate: examDate ? new Date(examDate) : null }
          : {}),
      },
    });

    return res
      .status(200)
      .json({ message: "Subject updated successfully", subject });
  } catch (error) {
    console.error("Update subject failed:", error);
    return res.status(500).json({ message: "Failed to update subject" });
  }
});

// DELETE: Delete subject
app.delete("/api/subjects/:id", async (req, res) => {
  try {
    const existing = await prisma.subject.findFirst({
      where: { id: req.params.id, userId: DEV_USER_ID },
    });

    if (!existing) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await prisma.subject.delete({ where: { id: existing.id } });

    return res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Delete subject failed:", error);
    return res.status(500).json({ message: "Failed to delete subject" });
  }
});

// ==================== TOPICS ====================

// POST: Create topic under a subject
app.post("/api/subjects/:subjectId/topics", async (req, res) => {
  try {
    const { name } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Topic name is required" });
    }

    const subject = await prisma.subject.findFirst({
      where: { id: req.params.subjectId, userId: DEV_USER_ID },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const topic = await prisma.topic.create({
      data: { name: name.trim(), subjectId: subject.id },
    });

    return res
      .status(201)
      .json({ message: "Topic created successfully", topic });
  } catch (error) {
    console.error("Create topic failed:", error);
    return res.status(500).json({ message: "Failed to create topic" });
  }
});

// GET: List topics for a subject
app.get("/api/subjects/:subjectId/topics", async (req, res) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: req.params.subjectId, userId: DEV_USER_ID },
      select: { id: true },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const topics = await prisma.topic.findMany({
      where: { subjectId: subject.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ topics });
  } catch (error) {
    console.error("Fetch topics failed:", error);
    return res.status(500).json({ message: "Failed to fetch topics" });
  }
});

// GET: One topic
app.get("/api/topics/:id", async (req, res) => {
  try {
    const topic = await prisma.topic.findFirst({
      where: {
        id: req.params.id,
        subject: { userId: DEV_USER_ID },
      },
      include: { subject: { select: { id: true, name: true } } },
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({ topic });
  } catch (error) {
    console.error("Fetch topic failed:", error);
    return res.status(500).json({ message: "Failed to fetch topic" });
  }
});

// PUT: Update topic name and/or status
app.put("/api/topics/:id", async (req, res) => {
  try {
    const { name, status } = req.body ?? {};

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ message: "Topic name cannot be empty" });
    }

    if (status !== undefined && !TOPIC_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        allowedStatuses: TOPIC_STATUSES,
      });
    }

    if (name === undefined && status === undefined) {
      return res
        .status(400)
        .json({ message: "Provide a name or status to update" });
    }

    const existing = await prisma.topic.findFirst({
      where: {
        id: req.params.id,
        subject: { userId: DEV_USER_ID },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const topic = await prisma.topic.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return res
      .status(200)
      .json({ message: "Topic updated successfully", topic });
  } catch (error) {
    console.error("Update topic failed:", error);
    return res.status(500).json({ message: "Failed to update topic" });
  }
});

// DELETE: Delete topic
app.delete("/api/topics/:id", async (req, res) => {
  try {
    const existing = await prisma.topic.findFirst({
      where: {
        id: req.params.id,
        subject: { userId: DEV_USER_ID },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Topic not found" });
    }

    await prisma.topic.delete({ where: { id: existing.id } });

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Delete topic failed:", error);
    return res.status(500).json({ message: "Failed to delete topic" });
  }
});

export default app;
