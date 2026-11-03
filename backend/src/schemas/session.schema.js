import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseTimeToMinutes(timeStr) {
  if (typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export const sessionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    subjectId: z.string().min(1),
    topicId: z.string().min(1).optional().nullable(),
    date: z.string().regex(datePattern, "Date must use YYYY-MM-DD format"),
    startTime: z.string().regex(timePattern, "Start time must use HH:MM format (00:00-23:59)"),
    endTime: z.string().regex(timePattern, "End time must use HH:MM format (00:00-23:59)"),
    duration: z.number().int().positive().max(1440).optional(),
    status: z.enum(["upcoming", "completed", "missed"]).optional(),
  })
  .superRefine((data, ctx) => {
    const startMins = parseTimeToMinutes(data.startTime);
    const endMins = parseTimeToMinutes(data.endTime);

    if (startMins === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time must be a valid time (00:00-23:59)",
      });
      return;
    }

    if (endMins === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be a valid time (00:00-23:59)",
      });
      return;
    }

    if (endMins === startMins) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time",
      });
      return;
    }

    if (endMins < startMins) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time cannot be earlier than start time",
      });
      return;
    }

    const expectedDuration = endMins - startMins;
    if (data.duration !== undefined && data.duration !== expectedDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: `Duration must match the difference between start time and end time (${expectedDuration} min)`,
      });
    }
  })
  .transform((data) => {
    const startMins = parseTimeToMinutes(data.startTime);
    const endMins = parseTimeToMinutes(data.endTime);
    const derivedDuration =
      startMins !== null && endMins !== null && endMins > startMins
        ? endMins - startMins
        : data.duration;
    return {
      ...data,
      duration: derivedDuration,
    };
  });

export const sessionUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    subjectId: z.string().min(1).optional(),
    topicId: z.string().min(1).optional().nullable(),
    date: z.string().regex(datePattern, "Date must use YYYY-MM-DD format").optional(),
    startTime: z.string().regex(timePattern, "Start time must use HH:MM format (00:00-23:59)").optional(),
    endTime: z.string().regex(timePattern, "End time must use HH:MM format (00:00-23:59)").optional(),
    duration: z.number().int().positive().max(1440).optional(),
    status: z.enum(["upcoming", "completed", "missed"]).optional(),
  })
  .superRefine((data, ctx) => {
    const startMins = data.startTime ? parseTimeToMinutes(data.startTime) : null;
    const endMins = data.endTime ? parseTimeToMinutes(data.endTime) : null;

    if (data.startTime && startMins === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Start time must be a valid time (00:00-23:59)",
      });
    }

    if (data.endTime && endMins === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be a valid time (00:00-23:59)",
      });
    }

    if (data.startTime && data.endTime && startMins !== null && endMins !== null) {
      if (endMins === startMins) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "End time must be later than start time",
        });
      } else if (endMins < startMins) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "End time cannot be earlier than start time",
        });
      } else {
        const expectedDuration = endMins - startMins;
        if (data.duration !== undefined && data.duration !== expectedDuration) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["duration"],
            message: `Duration must match the difference between start time and end time (${expectedDuration} min)`,
          });
        }
      }
    }
  })
  .transform((data) => {
    if (data.startTime && data.endTime) {
      const startMins = parseTimeToMinutes(data.startTime);
      const endMins = parseTimeToMinutes(data.endTime);
      if (startMins !== null && endMins !== null && endMins > startMins) {
        return {
          ...data,
          duration: endMins - startMins,
        };
      }
    }
    return data;
  });
