import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(255),
  code: z.string().max(255).nullish(),
  color: z.string().max(255),
  examDate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.coerce.date().nullish()
  ),
});

export const subjectUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").max(255).optional(),
    code: z.string().max(255).nullish().optional(),
    color: z.string().max(255).optional(),
    examDate: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : val),
      z.coerce.date().nullish()
    ).optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0 &&
      Object.values(data).some((val) => val !== undefined),
    {
      message: "Provide at least one field to update",
    },
  );
