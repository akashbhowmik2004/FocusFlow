import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TopicReviewDialog from './TopicReviewDialog'

describe('TopicReviewDialog', () => {
  const mockTopic = {
    id: 'top-1',
    name: 'Dynamic Programming & Memoization',
    status: 'in-progress',
    lastRevised: '2026-10-25',
    nextRevision: '2026-10-30',
    intervalDays: 5,
    revisionCount: 2,
    schedulingType: 'algorithm',
  }

  const mockSubject = {
    id: 'sub-1',
    name: 'Algorithms & Data Structures',
    code: 'CS201',
    color: '#3b82f6',
  }

  it('renders header, topic name, subject, and today date', () => {
    render(
      <TopicReviewDialog
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onSaveReview={vi.fn()}
      />
    )

    expect(screen.getByText('Dynamic Programming & Memoization')).toBeInTheDocument()
    expect(screen.getByText('CS201')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Revision')).toBeInTheDocument()
    expect(screen.getByText(/Today's revision date:/i)).toBeInTheDocument()
  })

  it('displays the 4 recall options and question', () => {
    render(
      <TopicReviewDialog
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onSaveReview={vi.fn()}
      />
    )

    expect(screen.getByText('How well did you remember this topic?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Again/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Hard/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Good/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Easy/i })).toBeInTheDocument()
    expect(screen.getByText("I couldn't remember it.")).toBeInTheDocument()
    expect(screen.getByText('I remembered with difficulty.')).toBeInTheDocument()
    expect(screen.getByText('I remembered most of it.')).toBeInTheDocument()
    expect(screen.getByText('I remembered it comfortably.')).toBeInTheDocument()
  })

  it('updates next revision preview when different recall options are clicked', async () => {
    render(
      <TopicReviewDialog
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onSaveReview={vi.fn()}
      />
    )

    // Default is Good
    expect(screen.getByText(/Next Scheduled Revision Preview/i)).toBeInTheDocument()

    // Click "Again"
    const againOption = screen.getByRole('radio', { name: /Again/i })
    fireEvent.click(againOption)
    await waitFor(() => {
      expect(screen.getByText(/1 day interval/i)).toBeInTheDocument()
    })

    // Click "Easy"
    const easyOption = screen.getByRole('radio', { name: /Easy/i })
    fireEvent.click(easyOption)
    await waitFor(() => {
      expect(screen.getByText(/days interval/i)).toBeInTheDocument()
    })
  })

  it('calls onSaveReview with calculated data when Save Review is clicked', () => {
    const handleSave = vi.fn()
    const handleClose = vi.fn()

    render(
      <TopicReviewDialog
        open={true}
        onClose={handleClose}
        topic={mockTopic}
        subject={mockSubject}
        onSaveReview={handleSave}
      />
    )

    const saveBtn = screen.getByRole('button', { name: /Save Review/i })
    fireEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        topicId: 'top-1',
        recall: 'good',
        schedulingType: 'algorithm',
      })
    )
    expect(handleClose).toHaveBeenCalled()
  })
})
