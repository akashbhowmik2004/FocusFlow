import { describe, it, expect } from 'vitest'
import { createTopicSchema, updateTopicSchema } from './topic.schema'

describe('Topic Zod Validation Schema', () => {
  it('validates a correct topic payload with default status', () => {
    const result = createTopicSchema.safeParse({ name: 'Asymptotic Complexity' })
    expect(result.success).toBe(true)
    expect(result.data.status).toBe('not-started')
    expect(result.data.name).toBe('Asymptotic Complexity')
  })

  it('rejects an empty topic name', () => {
    const result = createTopicSchema.safeParse({ name: '   ' })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toBe('Topic name is required')
  })

  it('rejects a topic name longer than 150 characters', () => {
    const longName = 'a'.repeat(151)
    const result = createTopicSchema.safeParse({ name: longName })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toBe('Topic name cannot exceed 150 characters')
  })

  it('rejects an invalid status enum', () => {
    const result = createTopicSchema.safeParse({
      name: 'Valid Name',
      status: 'archived',
    })
    expect(result.success).toBe(false)
  })

  it('validates partial update schema with valid status', () => {
    const result = updateTopicSchema.safeParse({ status: 'completed' })
    expect(result.success).toBe(true)
    expect(result.data.status).toBe('completed')
  })

  it('rejects empty update payload', () => {
    const result = updateTopicSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toBe('At least one field must be provided to update')
  })
})
