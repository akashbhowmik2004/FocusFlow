import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TopicRow from './TopicRow'

describe('TopicRow', () => {
  const mockTopic = {
    id: 'top-1',
    name: 'Stacks & Queues',
    status: 'completed',
    lastRevised: '2026-10-25',
    nextRevision: '2026-11-01',
    schedulingType: 'algorithm',
  }

  const mockSubject = {
    id: 'sub-1',
    name: 'Computer Science',
    color: '#3b82f6',
  }

  it('renders topic name, status, and revision dates', () => {
    render(
      <TopicRow
        topic={mockTopic}
        subject={mockSubject}
        onOpenDetails={vi.fn()}
        onToggleComplete={vi.fn()}
        onChangeStatus={vi.fn()}
        onQuickReview={vi.fn()}
        onDeleteTopic={vi.fn()}
      />
    )

    expect(screen.getByText('Stacks & Queues')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText(/Last:/i)).toBeInTheDocument()
    expect(screen.getByText(/Next:/i)).toBeInTheDocument()
    expect(screen.getByTitle('Open Topic Details')).toBeInTheDocument()
  })

  it('toggles complete on checkbox button click', () => {
    const handleToggle = vi.fn()
    render(
      <TopicRow
        topic={mockTopic}
        subject={mockSubject}
        onOpenDetails={vi.fn()}
        onToggleComplete={handleToggle}
        onChangeStatus={vi.fn()}
        onQuickReview={vi.fn()}
        onDeleteTopic={vi.fn()}
      />
    )

    const checkbox = screen.getByTitle('Mark as in-progress')
    fireEvent.click(checkbox)
    expect(handleToggle).toHaveBeenCalledWith(mockTopic)
  })

  it('opens details when clicking details button or row', () => {
    const handleOpenDetails = vi.fn()
    render(
      <TopicRow
        topic={mockTopic}
        subject={mockSubject}
        onOpenDetails={handleOpenDetails}
        onToggleComplete={vi.fn()}
        onChangeStatus={vi.fn()}
        onQuickReview={vi.fn()}
        onDeleteTopic={vi.fn()}
      />
    )

    const detailsBtn = screen.getByTitle('Open Topic Details')
    fireEvent.click(detailsBtn)
    expect(handleOpenDetails).toHaveBeenCalledWith(mockTopic)
  })
})
