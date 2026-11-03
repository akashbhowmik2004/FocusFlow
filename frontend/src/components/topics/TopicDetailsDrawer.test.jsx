import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopicDetailsDrawer from './TopicDetailsDrawer'

describe('TopicDetailsDrawer', () => {
  const mockTopic = {
    id: 'top-1',
    name: 'Graph Traversal (BFS & DFS)',
    status: 'in-progress',
    lastRevised: '2026-10-28',
    nextRevision: '2026-11-04',
    intervalDays: 7,
    revisionCount: 2,
    schedulingType: 'algorithm',
    revisionHistory: [
      { id: 'rev-1', revisionNumber: 1, date: '2026-10-21', recall: 'hard', intervalDays: 3 },
      { id: 'rev-2', revisionNumber: 2, date: '2026-10-28', recall: 'good', intervalDays: 7 },
    ],
  }

  const mockSubject = {
    id: 'sub-1',
    name: 'Data Structures',
    code: 'CS201',
    color: '#3b82f6',
  }

  it('renders topic name, parent subject, and learning status badge', () => {
    render(
      <TopicDetailsDrawer
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
      />
    )

    expect(screen.getByText('Graph Traversal (BFS & DFS)')).toBeInTheDocument()
    expect(screen.getByText('CS201')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders revision information metrics correctly', () => {
    render(
      <TopicDetailsDrawer
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
      />
    )

    expect(screen.getByText(/Total Reviews/i)).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    expect(screen.getByText(/Current Interval/i)).toBeInTheDocument()
    expect(screen.getAllByText('7d').length).toBeGreaterThan(0)
    expect(screen.getByText(/Next Revision/i)).toBeInTheDocument()
    expect(screen.getByText(/Last Revised/i)).toBeInTheDocument()
  })

  it('renders compact revision history table', () => {
    render(
      <TopicDetailsDrawer
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
      />
    )

    expect(screen.getByText(/Revision History/i)).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getAllByText('Good').length).toBeGreaterThan(0)
  })

  it('triggers action buttons: Review Now, Mark as Revised Today, and Schedule', () => {
    const handleReviewNow = vi.fn()
    const handleMarkRevisedToday = vi.fn()
    const handleOpenSchedule = vi.fn()

    render(
      <TopicDetailsDrawer
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onReviewNow={handleReviewNow}
        onMarkRevisedToday={handleMarkRevisedToday}
        onOpenSchedule={handleOpenSchedule}
      />
    )

    const reviewBtn = screen.getByRole('button', { name: /Review Now/i })
    fireEvent.click(reviewBtn)
    expect(handleReviewNow).toHaveBeenCalled()

    const markRevisedBtn = screen.getByRole('button', { name: /Mark as Revised Today/i })
    fireEvent.click(markRevisedBtn)
    expect(handleMarkRevisedToday).toHaveBeenCalled()

    const scheduleBtn = screen.getByRole('button', { name: /Schedule/i })
    fireEvent.click(scheduleBtn)
    expect(handleOpenSchedule).toHaveBeenCalled()
  })
})
