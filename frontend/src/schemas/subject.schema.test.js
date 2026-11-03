import { describe, it, expect } from 'vitest'
import { subjectSchema, subjectUpdateSchema } from './subject.schema'

describe('Subject Zod Schemas', () => {
  describe('subjectSchema', () => {
    it('accepts valid subject data with code and examDate', () => {
      const input = {
        name: 'Distributed Systems',
        code: 'CS450',
        color: '#3b82f6',
        examDate: '2026-11-20',
      }
      const result = subjectSchema.safeParse(input)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Distributed Systems')
      expect(result.data.code).toBe('CS450')
      expect(result.data.color).toBe('#3b82f6')
      expect(result.data.examDate).toBe('2026-11-20')
    })

    it('rejects empty or whitespace-only name with exact error message', () => {
      const resultEmpty = subjectSchema.safeParse({
        name: '',
        color: '#3b82f6',
      })
      expect(resultEmpty.success).toBe(false)
      expect(resultEmpty.error.issues[0].message).toBe('Subject name is required')

      const resultWhitespace = subjectSchema.safeParse({
        name: '    ',
        color: '#3b82f6',
      })
      expect(resultWhitespace.success).toBe(false)
      expect(resultWhitespace.error.issues[0].message).toBe('Subject name is required')
    })

    it('rejects missing name or color', () => {
      const resultMissing = subjectSchema.safeParse({
        code: 'CS101',
      })
      expect(resultMissing.success).toBe(false)
    })

    it('transforms empty string code and examDate to null', () => {
      const result = subjectSchema.safeParse({
        name: 'Operating Systems',
        code: '   ',
        color: '#10b981',
        examDate: '',
      })
      expect(result.success).toBe(true)
      expect(result.data.code).toBeNull()
      expect(result.data.examDate).toBeNull()
    })

    it('rejects names longer than 255 characters', () => {
      const longName = 'A'.repeat(256)
      const result = subjectSchema.safeParse({
        name: longName,
        color: '#10b981',
      })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('cannot exceed 255 characters')
    })
  })

  describe('subjectUpdateSchema', () => {
    it('accepts single field update', () => {
      const result = subjectUpdateSchema.safeParse({
        name: 'Advanced Algorithms',
      })
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Advanced Algorithms')
    })

    it('rejects empty update object', () => {
      const result = subjectUpdateSchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toBe('Provide at least one field to update')
    })

    it('rejects empty name in update', () => {
      const result = subjectUpdateSchema.safeParse({
        name: '',
      })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toBe('Subject name cannot be empty')
    })
  })
})
