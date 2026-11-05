import { z } from 'zod'

/**
 * Topic Schema Definition
 * Synchronized with backend validation rules for topic creation and updates.
 */

export const topicStatusEnum = z.enum(['not-started', 'in-progress', 'completed'], {
  errorMap: () => ({ message: 'Status must be not-started, in-progress, or completed' }),
})

export const createTopicSchema = z.object({
  name: z
    .string({ required_error: 'Topic name is required' })
    .trim()
    .min(1, 'Topic name is required')
    .max(150, 'Topic name cannot exceed 150 characters'),
  status: topicStatusEnum.default('not-started'),
})

export const updateTopicSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Topic name is required')
      .max(150, 'Topic name cannot exceed 150 characters')
      .optional(),
    status: topicStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  })
