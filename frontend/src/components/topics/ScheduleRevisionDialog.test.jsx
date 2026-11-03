import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ScheduleRevisionDialog from './ScheduleRevisionDialog'

describe('ScheduleRevisionDialog', () => {
  const mockTopic = {
    id: 'top-1',
    name: 'Binary Search Trees',
    status: 'completed',
    nextRevision: '2026-11-05',
    schedulingType: 'algorithm',
  }

  const mockSubject = {
    id: 'sub-1',
    name: 'Computer Science',
    color: '#3b82f6',
  }

  it('renders current schedule and algorithm distinction badge', () => {
    render(
      <ScheduleRevisionDialog
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onSaveSchedule={vi.fn()}
      />
    )

    expect(screen.getByText('Schedule Next Revision')).toBeInTheDocument()
    expect(screen.getByText('Binary Search Trees')).toBeInTheDocument()
    expect(screen.getByText(/Algorithm Calculated/i)).toBeInTheDocument()
    expect(screen.getByText(/Manual Schedule:/i)).toBeInTheDocument()
  })

  it('renders quick date presets and updates selected date', () => {
    render(
      <ScheduleRevisionDialog
        open={true}
        onClose={vi.fn()}
        topic={mockTopic}
        subject={mockSubject}
        onSaveSchedule={vi.fn()}
      />
    )

    const dateInput = screen.getByLabelText(/Select New Revision Date/i)
    expect(dateInput).toBeInTheDocument()

    // Click quick preset "Tomorrow (+1d)"
    const presetBtn = screen.getByRole('button', { name: /Tomorrow \(\+1d\)/i })
    fireEvent.click(presetBtn)

    expect(dateInput.value).not.toBe('')
  })

  it('calls onSaveSchedule with manual schedulingType on submit', () => {
    const handleSave = vi.fn()
    const handleClose = vi.fn()

    render(
      <ScheduleRevisionDialog
        open={true}
        onClose={handleClose}
        topic={mockTopic}
        subject={mockSubject}
        onSaveSchedule={handleSave}
      />
    )

    const saveBtn = screen.getByRole('button', { name: /Save Schedule/i })
    fireEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        topicId: 'top-1',
        schedulingType: 'manual',
      })
    )
    expect(handleClose).toHaveBeenCalled()
  })
})
