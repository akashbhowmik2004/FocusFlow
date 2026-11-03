import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SubjectCard, CourseCard } from './Card'

describe('SubjectCard / CourseCard Component', () => {
  // Fixed reference date helper to simulate relative dates
  const createDateOffset = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const baseSubject = {
    id: 'sub-comp-1',
    name: 'Distributed Systems',
    code: 'CS450',
    color: '#6366f1',
    examDate: createDateOffset(10),
    topics: [],
  }

  const renderCard = (props = {}, route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <SubjectCard subject={baseSubject} {...props} />
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Exam Countdown Logic & Statuses', () => {
    it('displays "X days left" when exam is more than one day away (e.g. 10 days away)', () => {
      renderCard({
        subject: { ...baseSubject, examDate: createDateOffset(10) },
      })

      expect(screen.getByText('10 days left')).toBeInTheDocument()
      expect(screen.queryByText(/-[0-9]+d left/)).not.toBeInTheDocument()
    })

    it('displays "1 day left" when exam is tomorrow', () => {
      renderCard({
        subject: { ...baseSubject, examDate: createDateOffset(1) },
      })

      expect(screen.getByText('1 day left')).toBeInTheDocument()
      expect(screen.queryByText('1 days left')).not.toBeInTheDocument()
    })

    it('displays "Exam today" when exam is today', () => {
      renderCard({
        subject: { ...baseSubject, examDate: createDateOffset(0) },
      })

      expect(screen.getByText('Exam today')).toBeInTheDocument()
      expect(screen.queryByText(/0d left/)).not.toBeInTheDocument()
    })

    it('displays "Exam completed" when exam was yesterday (never negative countdown)', () => {
      renderCard({
        subject: { ...baseSubject, examDate: createDateOffset(-1) },
      })

      expect(screen.getByText('Exam completed')).toBeInTheDocument()
      expect(screen.queryByText('-1d left')).not.toBeInTheDocument()
      expect(screen.queryByText(/-[0-9]+d left/)).not.toBeInTheDocument()
    })

    it('displays "Exam completed" when exam was several months in the past', () => {
      renderCard({
        subject: { ...baseSubject, examDate: createDateOffset(-90) },
      })

      expect(screen.getByText('Exam completed')).toBeInTheDocument()
      expect(screen.queryByText(/-[0-9]+d left/)).not.toBeInTheDocument()
    })

    it('displays "No exam date set" when exam date is missing', () => {
      renderCard({
        subject: { ...baseSubject, examDate: null },
      })

      expect(screen.getByText('No exam date set')).toBeInTheDocument()
    })

    it('displays "No exam date set" when exam date is an empty string or undefined', () => {
      renderCard({
        subject: { ...baseSubject, examDate: '' },
      })

      expect(screen.getByText('No exam date set')).toBeInTheDocument()
    })

    it('displays "No exam date set" when exam date is invalid', () => {
      renderCard({
        subject: { ...baseSubject, examDate: 'not-a-valid-date-string' },
      })

      expect(screen.getByText('No exam date set')).toBeInTheDocument()
    })

    it('keeps the exam date visible even when exam is completed', () => {
      const pastDate = '2026-03-15'
      renderCard({
        subject: { ...baseSubject, examDate: pastDate },
      })

      expect(screen.getByText('Exam completed')).toBeInTheDocument()
      expect(screen.getByText(/Exam: Mar 15, 2026/)).toBeInTheDocument()
    })
  })

  describe('2. Empty Syllabus State', () => {
    it('displays meaningful empty state when course has zero syllabus topics', () => {
      renderCard({
        subject: { ...baseSubject, topics: [] },
        totalTopics: 0,
        completedTopics: 0,
      })

      // Must display the suggested empty state copy
      expect(screen.getByText('No syllabus added yet')).toBeInTheDocument()
      expect(
        screen.getByText('Add your syllabus chapters to track your preparation and revision progress.')
      ).toBeInTheDocument()

      // Primary action CTA button exists
      const addBtn = screen.getByRole('link', { name: /Add syllabus chapters/i })
      expect(addBtn).toBeInTheDocument()
      expect(addBtn).toHaveAttribute('href', `/app/subjects/${baseSubject.id}?addTopic=true`)

      // Must NOT display misleading 0% mastery metrics or zero module counts
      expect(screen.queryByText('0 syllabus modules')).not.toBeInTheDocument()
      expect(screen.queryByText('Syllabus Mastery')).not.toBeInTheDocument()
      expect(screen.queryByText('0 mastered')).not.toBeInTheDocument()
      expect(screen.queryByText('0 remaining')).not.toBeInTheDocument()

      // Bottom link says Manage Course & Syllabus
      expect(screen.getByText('Manage Course & Syllabus')).toBeInTheDocument()
    })

    it('triggers onAddSyllabus callback when provided and action is clicked', () => {
      const onAddSyllabusMock = vi.fn()
      renderCard({
        subject: { ...baseSubject, topics: [] },
        totalTopics: 0,
        completedTopics: 0,
        onAddSyllabus: onAddSyllabusMock,
      })

      const addBtn = screen.getByRole('link', { name: /Add syllabus chapters/i })
      fireEvent.click(addBtn)

      expect(onAddSyllabusMock).toHaveBeenCalledTimes(1)
      expect(onAddSyllabusMock).toHaveBeenCalledWith(expect.objectContaining({ id: baseSubject.id }))
    })

    it('zero-module division-by-zero protection works and does not throw', () => {
      expect(() => {
        renderCard({
          subject: { ...baseSubject, topics: [] },
          totalTopics: 0,
          completedTopics: 0,
        })
      }).not.toThrow()
    })
  })

  describe('3. Mastery Progress Display when Syllabus Modules Exist', () => {
    it('renders correctly with one module and no mastered topics (0%)', () => {
      const subjectWithOneTopic = {
        ...baseSubject,
        topics: [{ id: 'top-1', name: 'Introduction', status: 'not-started' }],
      }

      renderCard({
        subject: subjectWithOneTopic,
        totalTopics: 1,
        completedTopics: 0,
      })

      expect(screen.getByText('1 syllabus module')).toBeInTheDocument()
      expect(screen.getByText('Syllabus Mastery')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('0 mastered')).toBeInTheDocument()
      expect(screen.getByText('1 remaining')).toBeInTheDocument()
      expect(screen.queryByText('No syllabus added yet')).not.toBeInTheDocument()
    })

    it('renders correctly with partially completed syllabus (e.g. 2 of 4 mastered = 50%)', () => {
      const subjectWithTopics = {
        ...baseSubject,
        topics: [
          { id: 'top-1', name: 'Chapter 1', status: 'completed' },
          { id: 'top-2', name: 'Chapter 2', status: 'completed' },
          { id: 'top-3', name: 'Chapter 3', status: 'in-progress' },
          { id: 'top-4', name: 'Chapter 4', status: 'not-started' },
        ],
      }

      renderCard({
        subject: subjectWithTopics,
        totalTopics: 4,
        completedTopics: 2,
      })

      expect(screen.getByText('4 syllabus modules')).toBeInTheDocument()
      expect(screen.getByText('Syllabus Mastery')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('2 mastered')).toBeInTheDocument()
      expect(screen.getByText('2 remaining')).toBeInTheDocument()
    })

    it('renders correctly with fully completed syllabus (100%)', () => {
      const subjectFullyMastered = {
        ...baseSubject,
        topics: [
          { id: 'top-1', name: 'Chapter 1', status: 'completed' },
          { id: 'top-2', name: 'Chapter 2', status: 'completed' },
          { id: 'top-3', name: 'Chapter 3', status: 'completed' },
        ],
      }

      renderCard({
        subject: subjectFullyMastered,
        totalTopics: 3,
        completedTopics: 3,
      })

      expect(screen.getByText('3 syllabus modules')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('3 mastered')).toBeInTheDocument()
      expect(screen.getByText('0 remaining')).toBeInTheDocument()
    })

    it('derives topics and completion automatically from subject.topics when props are omitted', () => {
      const subjectWithData = {
        ...baseSubject,
        topics: [
          { id: 'top-1', name: 'A', status: 'completed' },
          { id: 'top-2', name: 'B', status: 'in-progress' },
        ],
      }

      renderCard({ subject: subjectWithData })

      expect(screen.getByText('2 syllabus modules')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('1 mastered')).toBeInTheDocument()
      expect(screen.getByText('1 remaining')).toBeInTheDocument()
    })
  })

  describe('4. Exam Completed State Preserves Real Syllabus Data', () => {
    it('does not automatically mark syllabus as completed when exam has passed', () => {
      // Past exam date, but only 1 of 3 topics completed
      renderCard({
        subject: {
          ...baseSubject,
          examDate: createDateOffset(-5),
          topics: [
            { id: 'top-1', name: 'Chapter 1', status: 'completed' },
            { id: 'top-2', name: 'Chapter 2', status: 'in-progress' },
            { id: 'top-3', name: 'Chapter 3', status: 'not-started' },
          ],
        },
        totalTopics: 3,
        completedTopics: 1,
      })

      // Shows Exam completed
      expect(screen.getByText('Exam completed')).toBeInTheDocument()

      // Preserves REAL mastery metrics: 33%, 1 mastered, 2 remaining
      expect(screen.getByText('3 syllabus modules')).toBeInTheDocument()
      expect(screen.getByText('33%')).toBeInTheDocument()
      expect(screen.getByText('1 mastered')).toBeInTheDocument()
      expect(screen.getByText('2 remaining')).toBeInTheDocument()
    })
  })

  describe('5. CourseCard Alias and Navigation', () => {
    it('CourseCard export functions identically to SubjectCard', () => {
      render(
        <MemoryRouter>
          <CourseCard
            subject={{
              ...baseSubject,
              examDate: createDateOffset(5),
              topics: [{ id: 'top-1', name: 'Ch 1', status: 'completed' }],
            }}
          />
        </MemoryRouter>
      )

      expect(screen.getByText('5 days left')).toBeInTheDocument()
      expect(screen.getByText('1 syllabus module')).toBeInTheDocument()
    })

    it('invokes onExplore callback when bottom footer link is clicked', () => {
      const onExploreMock = vi.fn()
      renderCard({
        subject: {
          ...baseSubject,
          topics: [{ id: 'top-1', name: 'Ch 1', status: 'completed' }],
        },
        onExplore: onExploreMock,
      })

      const exploreLink = screen.getByText('Explore Syllabus Chapters')
      fireEvent.click(exploreLink)

      expect(onExploreMock).toHaveBeenCalledTimes(1)
      expect(onExploreMock).toHaveBeenCalledWith(expect.objectContaining({ id: baseSubject.id }))
    })
  })
})
