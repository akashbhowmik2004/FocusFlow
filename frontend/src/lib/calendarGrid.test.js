import { describe, it, expect } from 'vitest'
import {
  formatHourLabel,
  getTimeBounds,
  calculateSessionLayout,
  getDayStudyStats,
  getWeekStudyStats,
} from './calendarGrid'

describe('calendarGrid utilities', () => {
  describe('formatHourLabel', () => {
    it('formats midnight, noon, morning, and evening hours', () => {
      expect(formatHourLabel(0)).toBe('12:00 AM')
      expect(formatHourLabel(8)).toBe('08:00 AM')
      expect(formatHourLabel(12)).toBe('12:00 PM')
      expect(formatHourLabel(14)).toBe('02:00 PM')
      expect(formatHourLabel(22)).toBe('10:00 PM')
      expect(formatHourLabel(23)).toBe('11:00 PM')
    })
  })

  describe('getTimeBounds', () => {
    it('returns default bounds (07:00 to 22:00) when sessions fall within bounds', () => {
      const sessions = [
        { startTime: '09:00', endTime: '10:30' },
        { startTime: '14:00', endTime: '16:00' },
      ]
      const bounds = getTimeBounds(sessions)
      expect(bounds.startHour).toBe(7)
      expect(bounds.endHour).toBe(22)
      expect(bounds.totalHours).toBe(15)
    })

    it('expands bounds when sessions start earlier than 07:00 or end later than 22:00', () => {
      const sessions = [
        { startTime: '05:30', endTime: '07:00' },
        { startTime: '22:15', endTime: '23:30' },
      ]
      const bounds = getTimeBounds(sessions)
      expect(bounds.startHour).toBe(5)
      expect(bounds.endHour).toBe(24)
      expect(bounds.totalHours).toBe(19)
    })
  })

  describe('calculateSessionLayout', () => {
    it('returns empty array when no sessions provided', () => {
      expect(calculateSessionLayout([])).toEqual([])
    })

    it('calculates full width (100%) when sessions do not overlap', () => {
      const sessions = [
        { id: 's1', startTime: '09:00', endTime: '10:00' },
        { id: 's2', startTime: '11:00', endTime: '12:00' },
      ]
      const layout = calculateSessionLayout(sessions, 7, 22)
      expect(layout).toHaveLength(2)
      expect(layout[0].totalCols).toBe(1)
      expect(layout[0].widthPercent).toBe(100)
      expect(layout[0].leftPercent).toBe(0)
      expect(layout[1].totalCols).toBe(1)
      expect(layout[1].widthPercent).toBe(100)
      expect(layout[1].leftPercent).toBe(0)
    })

    it('splits overlapping sessions into side-by-side sub-columns to prevent occlusion', () => {
      const sessions = [
        { id: 's1', startTime: '10:00', endTime: '11:30' },
        { id: 's2', startTime: '10:30', endTime: '12:00' },
      ]
      const layout = calculateSessionLayout(sessions, 7, 22)
      expect(layout).toHaveLength(2)
      // Both belong to 2-column collision cluster
      expect(layout[0].totalCols).toBe(2)
      expect(layout[0].widthPercent).toBe(50)
      expect(layout[0].leftPercent).toBe(0)

      expect(layout[1].totalCols).toBe(2)
      expect(layout[1].widthPercent).toBe(50)
      expect(layout[1].leftPercent).toBe(50)
    })

    it('handles 3 overlapping sessions properly', () => {
      const sessions = [
        { id: 's1', startTime: '14:00', endTime: '16:00' },
        { id: 's2', startTime: '14:30', endTime: '15:30' },
        { id: 's3', startTime: '15:00', endTime: '16:30' },
      ]
      const layout = calculateSessionLayout(sessions, 7, 22)
      expect(layout).toHaveLength(3)
      expect(layout[0].totalCols).toBeGreaterThanOrEqual(2)
      // Every session has a distinct left offset or non-occluding coordinate
      const leftOffsets = layout.map((l) => l.leftPercent)
      expect(leftOffsets).toContain(0)
      expect(new Set(leftOffsets).size).toBeGreaterThanOrEqual(2)
    })
  })

  describe('getDayStudyStats & getWeekStudyStats', () => {
    it('aggregates daily planned minutes excluding cancelled sessions', () => {
      const sessions = [
        { date: '2026-11-05', duration: 90, status: 'upcoming' },
        { date: '2026-11-05', duration: 60, status: 'completed' },
        { date: '2026-11-05', duration: 45, status: 'cancelled' },
      ]
      const stats = getDayStudyStats(sessions, '2026-11-05')
      expect(stats.plannedMinutes).toBe(150)
      expect(stats.plannedHours).toBe(2.5)
      expect(stats.completedCount).toBe(1)
      expect(stats.upcomingCount).toBe(1)
      expect(stats.sessionCount).toBe(3)
    })

    it('aggregates weekly statistics correctly', () => {
      const weekDays = [
        new Date(2026, 10, 2),
        new Date(2026, 10, 3),
        new Date(2026, 10, 4),
        new Date(2026, 10, 5),
        new Date(2026, 10, 6),
        new Date(2026, 10, 7),
        new Date(2026, 10, 8),
      ]
      const sessions = [
        { date: '2026-11-02', duration: 60, status: 'completed' },
        { date: '2026-11-05', duration: 120, status: 'upcoming' },
      ]
      const stats = getWeekStudyStats(sessions, weekDays, (d) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      })

      expect(stats.totalPlannedMinutes).toBe(180)
      expect(stats.totalPlannedHours).toBe(3.0)
      expect(stats.dailyMinutes).toHaveLength(7)
      expect(stats.dailyMinutes[0]).toBe(60) // Monday Nov 2
      expect(stats.dailyMinutes[3]).toBe(120) // Thursday Nov 5
    })
  })
})
