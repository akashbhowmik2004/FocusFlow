import { z } from "zod";

export const createTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Topic name is required")
    .max(150, "Topic name cannot exceed 150 characters"),

  status: z
    .enum(["not-started", "in-progress", "completed"])
    .default("not-started"),
});

export const updateTopicSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Topic name is required")
      .max(150, "Topic name cannot exceed 150 characters")
      .optional(),

    status: z.enum(["not-started", "in-progress", "completed"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createRevisionSchema = z
  .object({
    rating: z.enum(["AGAIN", "HARD", "GOOD", "EASY"], {
      error: "Rating is required and must be one of: AGAIN, HARD, GOOD, EASY",
    }),
  })
  .strict();

export const manualRevisionScheduleSchema = z
  .object({
    nextRevision: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  })
  .strict();
