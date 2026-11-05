import { describe, it, expect } from 'vitest'
import {
  isTopicStudiedToday,
  getTopicTodayCompletedSessions,
  canStartFocusSession,
  canResumeFocusSession,
} from './topicFocus'

describe('topicFocus utilities', () => {
  const refDate = new Date('2026-11-05T12:00:00.000Z')

  describe('isTopicStudiedToday', () => {
    it('returns true when a session for this topic is completed today with completedAt', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-05T09:30:00.000Z',
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(true)
    })

    it('returns false when a session was completed yesterday', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-04T20:00:00.000Z',
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when a session is recorded for tomorrow', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-06T08:00:00.000Z',
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when session is upcoming today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'upcoming',
          date: '2026-11-05',
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when session is currently in-progress today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'in-progress',
          date: '2026-11-05',
          startedAt: '2026-11-05T11:45:00.000Z',
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when session is paused today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'paused',
          date: '2026-11-05',
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when session was cancelled today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'cancelled',
          cancelledAt: '2026-11-05T10:00:00.000Z',
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when session is missed today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'missed',
          date: '2026-11-05',
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when completed session belongs to a different topic', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-other',
          status: 'completed',
          completedAt: '2026-11-05T10:00:00.000Z',
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('returns false when completed session is at subject level without topicId', () => {
      const sessions = [
        {
          id: 's-1',
          subjectId: 'sub-1',
          topicId: null,
          status: 'completed',
          completedAt: '2026-11-05T10:00:00.000Z',
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('does not infer topic completion from syllabus completion status alone', () => {
      // Topic object might have status: 'completed' in syllabus, but no qualifying session exists
      const topic = { id: 'top-1', status: 'completed', name: 'Completed Chapter' }
      const sessions = []
      expect(isTopicStudiedToday(topic.id, sessions, refDate)).toBe(false)
    })

    it('returns false for legacy completed session with missing or null completedAt (uncalibrated)', () => {
      const sessions = [
        {
          id: 's-legacy',
          topicId: 'top-1',
          status: 'completed',
          date: '2026-11-05',
          completedAt: null, // Legacy record lacking completedAt timestamp
        },
      ]
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
    })

    it('handles midnight boundaries accurately', () => {
      const sessions = [
        {
          id: 's-midnight-prev',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-04T23:59:00.000Z',
        },
        {
          id: 's-midnight-next',
          topicId: 'top-2',
          status: 'completed',
          completedAt: '2026-11-05T00:01:00.000Z',
        },
      ]
      // For Nov 5, top-1 is false (Nov 4) and top-2 is true (Nov 5)
      expect(isTopicStudiedToday('top-1', sessions, refDate)).toBe(false)
      expect(isTopicStudiedToday('top-2', sessions, refDate)).toBe(true)
    })

    it('handles null, undefined, and empty inputs gracefully', () => {
      expect(isTopicStudiedToday(null, [])).toBe(false)
      expect(isTopicStudiedToday(undefined, [])).toBe(false)
      expect(isTopicStudiedToday('top-1', null)).toBe(false)
      expect(isTopicStudiedToday('top-1', undefined)).toBe(false)
      expect(isTopicStudiedToday('top-1', [])).toBe(false)
    })
  })

  describe('getTopicTodayCompletedSessions', () => {
    it('returns all completed sessions for this topic today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-05T09:00:00.000Z',
          duration: 45,
        },
        {
          id: 's-2',
          topicId: 'top-1',
          status: 'completed',
          completedAt: '2026-11-05T14:00:00.000Z',
          duration: 60,
        },
        {
          id: 's-3',
          topicId: 'top-2',
          status: 'completed',
          completedAt: '2026-11-05T11:00:00.000Z',
        },
        {
          id: 's-4',
          topicId: 'top-1',
          status: 'upcoming',
          date: '2026-11-05',
        },
      ]

      const completed = getTopicTodayCompletedSessions('top-1', sessions, refDate)
      expect(completed).toHaveLength(2)
      expect(completed.map((s) => s.id)).toEqual(['s-1', 's-2'])
    })

    it('returns empty array when no qualifying session exists', () => {
      expect(getTopicTodayCompletedSessions('top-1', [], refDate)).toEqual([])
      expect(getTopicTodayCompletedSessions(null, [], refDate)).toEqual([])
    })
  })

  describe('canStartFocusSession & canResumeFocusSession', () => {
    it('allows starting upcoming sessions', () => {
      expect(canStartFocusSession({ id: 's-1', status: 'upcoming' })).toBe(true)
    })

    it('allows starting/opening in-progress and paused sessions', () => {
      expect(canStartFocusSession({ id: 's-1', status: 'in-progress' })).toBe(true)
      expect(canStartFocusSession({ id: 's-1', status: 'paused' })).toBe(true)
    })

    it('strictly disallows starting completed sessions', () => {
      expect(canStartFocusSession({ id: 's-1', status: 'completed' })).toBe(false)
    })

    it('strictly disallows starting cancelled or missed sessions', () => {
      expect(canStartFocusSession({ id: 's-1', status: 'cancelled' })).toBe(false)
      expect(canStartFocusSession({ id: 's-1', status: 'missed' })).toBe(false)
    })

    it('disallows starting null/undefined sessions', () => {
      expect(canStartFocusSession(null)).toBe(false)
      expect(canStartFocusSession(undefined)).toBe(false)
    })

    it('canResumeFocusSession only returns true for paused sessions', () => {
      expect(canResumeFocusSession({ id: 's-1', status: 'paused' })).toBe(true)
      expect(canResumeFocusSession({ id: 's-1', status: 'upcoming' })).toBe(false)
      expect(canResumeFocusSession({ id: 's-1', status: 'in-progress' })).toBe(false)
      expect(canResumeFocusSession({ id: 's-1', status: 'completed' })).toBe(false)
      expect(canResumeFocusSession(null)).toBe(false)
    })
  })
})
