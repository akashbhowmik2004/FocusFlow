import { prisma } from "../lib/prisma.js";

export const addSubject = async (req, res) => {
  const { name, code, color, examDate } = req.body;
  const userId = req.user.id;
  try {
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code ?? null,
        color: color.trim(),
        examDate: examDate ?? null,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        topics: true,
      },
    });
    res.status(201).json({
      message: "Subject added successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjects = async (req, res) => {
  const userId = req.user.id;
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        userId: userId,
      },
      include: {
        topics: {
          include: {
            revisions: {
              orderBy: { reviewedAt: "desc" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      message: "Subjects retrieved successfully",
      subjects,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id,
        userId: userId,
      },
      include: {
        topics: {
          include: {
            revisions: {
              orderBy: { reviewedAt: "desc" },
            },
          },
        },
      },
    });
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.status(200).json({
      message: "Subject retrieved successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const dataToUpdate = req.body;
  try {
    const existing = await prisma.subject.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const subject = await prisma.subject.update({
      where: {
        id,
      },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        examDate: true,
        createdAt: true,
        updatedAt: true,
        topics: true,
      },
    });
    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const existing = await prisma.subject.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Subject not found" });
    }

    await prisma.subject.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Subject deleted successfully",
      id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
