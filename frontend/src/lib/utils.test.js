import { describe, it, expect } from 'vitest'
import { formatDuration, getInitials, cn } from './utils'

describe('Utils', () => {
  it('formats minutes into human readable hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(150)).toBe('2h 30m')
  })

  it('extracts initials from names correctly', () => {
    expect(getInitials('Alex Chen')).toBe('AC')
    expect(getInitials('Sarah')).toBe('S')
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('merges class names with tailwind-merge and clsx', () => {
    expect(cn('px-2 py-1', 'bg-blue-500')).toContain('bg-blue-500')
    expect(cn('p-4', false && 'hidden', 'p-2')).toBe('p-2')
  })
})
