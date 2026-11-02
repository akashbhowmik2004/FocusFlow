import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const sessionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subjectId: z.string().min(1),
  topicId: z.string().min(1).optional().nullable(),
  date: z.string().regex(datePattern, "Date must use YYYY-MM-DD format"),
  startTime: z.string().regex(timePattern, "Start time must use HH:MM format"),
  endTime: z.string().regex(timePattern, "End time must use HH:MM format"),
  duration: z.number().int().positive().max(1440),
  status: z.enum(["upcoming", "completed", "missed"]).optional(),
});

export const sessionUpdateSchema = sessionSchema.partial();
