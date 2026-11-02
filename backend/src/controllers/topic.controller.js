import { prisma } from "../lib/prisma.js";
import { calculateNextRevision } from "../services/spacedRepetition.service.js";

export const getAllTopics = async (req, res) => {
  try {
    const userId = req.user?.id;
    const topics = await prisma.topic.findMany({
      where: userId ? { subject: { userId } } : {},
    });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const topic = await prisma.topic.findFirst({
      where: {
        id,
        ...(userId ? { subject: { userId } } : {}),
      },
      include: {
        revisions: {
          orderBy: { reviewedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found", error: "Topic not found" });
    }

    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topic" });
  }
};

export const createTopic = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, status } = req.body;
    const userId = req.user.id;

    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        status,
        subjectId: subject.id,
      },
    });

    return res.status(201).json({
      message: "Topic created successfully",
      topic,
    });
  } catch (error) {
    console.error("Create topic error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const existingTopic = await prisma.topic.findFirst({
      where: {
        id,
        subject: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingTopic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: {
        id: existingTopic.id,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("Update topic error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createTopicRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { rating } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            // 1. Validate topic ownership through its parent Subject
            const topic = await tx.topic.findFirst({
              where: {
                id,
                subject: {
                  userId,
                },
              },
              select: {
                id: true,
                name: true,
                status: true,
                repetitions: true,
                intervalDays: true,
                easeFactor: true,
                lastRevised: true,
                nextRevision: true,
                subjectId: true,
                updatedAt: true,
              },
            });

            if (!topic) {
              const notFoundError = new Error("Topic not found");
              notFoundError.statusCode = 404;
              throw notFoundError;
            }

            // 2. Read current algorithm state and calculate next revision
            const reviewedAt = new Date();
            const calculation = calculateNextRevision({
              rating,
              repetitions: topic.repetitions ?? 0,
              intervalDays: topic.intervalDays ?? 0,
              easeFactor: topic.easeFactor ?? 2.5,
              reviewedAt,
            });

            // 3. Concurrency check & topic algorithm state update
            const updateResult = await tx.topic.updateMany({
              where: {
                id: topic.id,
                updatedAt: topic.updatedAt,
                repetitions: topic.repetitions,
              },
              data: {
                scheduleType: "SPACED",
                repetitions: calculation.repetitions,
                intervalDays: calculation.intervalDays,
                easeFactor: calculation.easeFactor,
                lastRevised: calculation.lastRevised,
                nextRevision: calculation.nextRevision,
              },
            });

            if (updateResult.count === 0) {
              const conflictErr = new Error(
                "Concurrent revision conflict detected",
              );
              conflictErr.code = "P2034";
              conflictErr.isConflict = true;
              throw conflictErr;
            }

            // Fetch the updated topic
            const updatedTopic = await tx.topic.findUnique({
              where: { id: topic.id },
              select: {
                id: true,
                name: true,
                status: true,
                repetitions: true,
                intervalDays: true,
                easeFactor: true,
                lastRevised: true,
                nextRevision: true,
              },
            });

            // 4. Create TopicRevision history record
            const revision = await tx.topicRevision.create({
              data: {
                topicId: topic.id,
                rating,
                source: "RECALL_ASSESSMENT",
                reviewedAt,
                previousInterval: topic.intervalDays ?? 0,
                intervalAfter: calculation.intervalDays,
                repetitionsAfter: calculation.repetitions,
                easeFactorAfter: calculation.easeFactor,
                nextRevisionAt: calculation.nextRevision,
              },
              select: {
                id: true,
                rating: true,
                previousInterval: true,
                intervalAfter: true,
                nextRevisionAt: true,
              },
            });

            return { topic: updatedTopic, revision };
          },
          {
            isolationLevel: "Serializable",
          },
        );

        return res.status(201).json({
          message: "Revision saved successfully",
          topic: {
            id: result.topic.id,
            name: result.topic.name,
            status: result.topic.status,
            repetitions: result.topic.repetitions,
            intervalDays: result.topic.intervalDays,
            easeFactor: result.topic.easeFactor,
            lastRevised: result.topic.lastRevised,
            nextRevision: result.topic.nextRevision,
          },
          revision: {
            id: result.revision.id,
            rating: result.revision.rating,
            previousInterval: result.revision.previousInterval,
            intervalAfter: result.revision.intervalAfter,
            nextRevisionAt: result.revision.nextRevisionAt,
          },
        });
      } catch (err) {
        if (err.statusCode === 404) {
          return res.status(404).json({
            message: "Topic not found",
          });
        }

        const isConflict =
          err.isConflict ||
          err.code === "P2034" ||
          err.code === "40001" ||
          err.message?.includes("could not serialize access") ||
          err.message?.includes("Concurrent revision conflict");

        if (isConflict && attempt < MAX_RETRIES) {
          const delay =
            Math.pow(2, attempt) * 20 + Math.floor(Math.random() * 20);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        lastError = err;
        break;
      }
    }

    if (
      lastError?.isConflict ||
      lastError?.code === "P2034" ||
      lastError?.code === "40001"
    ) {
      return res.status(409).json({
        message:
          "Conflict occurred while updating topic revision. Please try again.",
      });
    }

    console.error("Create revision error:", lastError);
    return res.status(500).json({
      message: "Internal server error",
    });
  } catch (error) {
    console.error("Create revision unexpected error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const scheduleTopicRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextRevision } = req.body;
    const userId = req.user.id;

    // Validate that the date is a real calendar date
    const [year, month, day] = nextRevision.split("-").map(Number);
    const requestedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      requestedDate.getUTCFullYear() !== year ||
      requestedDate.getUTCMonth() !== month - 1 ||
      requestedDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        message: "Invalid calendar date",
      });
    }

    // Compare date-only values in UTC to avoid timezone shifts
    const today = new Date();
    const todayDate = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );

    if (requestedDate.getTime() < todayDate) {
      return res.status(400).json({
        message: "Revision date cannot be in the past",
      });
    }

    // Verify topic ownership
    const topic = await prisma.topic.findFirst({
      where: {
        id,
        subject: {
          userId,
        },
      },
    });

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    // Update only the manual scheduling fields
    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: {
        nextRevision: requestedDate,
        scheduleType: "MANUAL",
      },
      select: {
        id: true,
        name: true,
        status: true,
        lastRevised: true,
        nextRevision: true,
        repetitions: true,
        intervalDays: true,
        easeFactor: true,
        scheduleType: true,
      },
    });

    return res.status(200).json({
      message: "Revision scheduled successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("Schedule topic revision error:", error);

    return res.status(500).json({
      message: "Failed to schedule revision",
    });
  }
};
