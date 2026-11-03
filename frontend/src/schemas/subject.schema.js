import { z } from 'zod'

export const subjectSchema = z.object({
  name: z
    .string({ required_error: 'Subject name is required' })
    .trim()
    .min(1, 'Subject name is required')
    .max(255, 'Subject name cannot exceed 255 characters'),
  code: z
    .string()
    .trim()
    .max(255, 'Course code cannot exceed 255 characters')
    .nullish()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  color: z
    .string({ required_error: 'Color theme is required' })
    .min(1, 'Color theme is required')
    .max(255),
  examDate: z
    .string()
    .nullish()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
})

export const subjectUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Subject name cannot be empty')
      .max(255, 'Subject name cannot exceed 255 characters')
      .optional(),
    code: z
      .string()
      .trim()
      .max(255, 'Course code cannot exceed 255 characters')
      .optional()
      .transform((val) =>
        val === undefined ? undefined : val && val.trim().length > 0 ? val.trim() : null
      ),
    color: z
      .string()
      .min(1, 'Color theme cannot be empty')
      .max(255)
      .optional(),
    examDate: z
      .string()
      .optional()
      .transform((val) =>
        val === undefined ? undefined : val && val.trim().length > 0 ? val.trim() : null
      ),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0 &&
      Object.values(data).some((val) => val !== undefined),
    {
      message: 'Provide at least one field to update',
    }
  )
