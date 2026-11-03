import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScheduleSessionDialog from './ScheduleSessionDialog'
import { useApp, useSessions } from '@/context/AppContext'

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
  useSessions: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ScheduleSessionDialog', () => {
  const mockSubjects = [
    { id: 'sub-1', name: 'Computer Science', code: 'CS101' },
    { id: 'sub-2', name: 'Mathematics', code: 'MATH201' },
  ]

  const mockAddSession = vi.fn()
  const mockUpdateSession = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useApp.mockReturnValue({
      state: { subjects: mockSubjects },
    })
    useSessions.mockReturnValue({
      addSession: mockAddSession,
      updateSession: mockUpdateSession,
    })
  })

  it('calculates duration on initial rendering and displays read-only indicator', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="09:00"
        defaultEndTime="10:30"
        defaultDate="2026-11-03"
      />
    )

    expect(screen.getByRole('heading', { name: 'Schedule Study Session' })).toBeInTheDocument()
    expect(screen.getByTestId('auto-calculated-indicator')).toHaveTextContent('Auto-calculated')

    const durationInput = screen.getByLabelText(/duration \(min\)/i)
    expect(durationInput).toHaveValue('90')
    expect(durationInput).toHaveAttribute('readonly')
    expect(durationInput).toHaveAttribute('aria-readonly', 'true')
  })

  it('updates duration immediately when start time changes', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
        defaultDate="2026-11-03"
      />
    )

    const startInput = screen.getByLabelText(/start time/i)
    const durationInput = screen.getByLabelText(/duration \(min\)/i)

    expect(durationInput).toHaveValue('60')

    // Change start time from 09:00 to 08:30 -> duration becomes 90 min
    fireEvent.change(startInput, { target: { value: '08:30' } })
    expect(durationInput).toHaveValue('90')

    // Change start time to 07:00 -> duration becomes 180 min
    fireEvent.change(startInput, { target: { value: '07:00' } })
    expect(durationInput).toHaveValue('180')
  })

  it('updates duration immediately when end time changes', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="14:00"
        defaultEndTime="15:30"
        defaultDate="2026-11-03"
      />
    )

    const startInput = screen.getByLabelText(/start time/i)
    const endInput = screen.getByLabelText(/end time/i)
    const durationInput = screen.getByLabelText(/duration \(min\)/i)

    // 14:00 to 15:30 = 90 min
    expect(durationInput).toHaveValue('90')

    // 10:15 to 11:45 = 90 min
    fireEvent.change(startInput, { target: { value: '10:15' } })
    fireEvent.change(endInput, { target: { value: '11:45' } })
    expect(durationInput).toHaveValue('90')

    // 13:00 to 14:20 = 80 min
    fireEvent.change(startInput, { target: { value: '13:00' } })
    fireEvent.change(endInput, { target: { value: '14:20' } })
    expect(durationInput).toHaveValue('80')

    // 15:30 to 18:30 = 180 min
    fireEvent.change(startInput, { target: { value: '15:30' } })
    fireEvent.change(endInput, { target: { value: '18:30' } })
    expect(durationInput).toHaveValue('180')
  })

  it('recalculates when editing an existing session', async () => {
    const existingSession = {
      id: 'sess-existing-1',
      title: 'Operating Systems - Concurrency',
      subjectId: 'sub-1',
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      date: '2026-11-04',
      status: 'upcoming',
    }

    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        initialSession={existingSession}
        defaultDate="2026-11-04"
      />
    )

    // Check pre-populated title and editing header
    expect(screen.getByRole('heading', { name: 'Edit Study Session' })).toBeInTheDocument()
    expect(screen.getByLabelText(/topic or focus area/i)).toHaveValue('Operating Systems - Concurrency')

    const durationInput = screen.getByLabelText(/duration \(min\)/i)
    expect(durationInput).toHaveValue('90')

    // Change end time from 15:30 to 16:30
    const endInput = screen.getByLabelText(/end time/i)
    fireEvent.change(endInput, { target: { value: '16:30' } })
    expect(durationInput).toHaveValue('150')

    // Submit the edited session
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    expect(mockUpdateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sess-existing-1',
        title: 'Operating Systems - Concurrency',
        startTime: '14:00',
        endTime: '16:30',
        duration: 150,
      })
    )
  })

  it('shows validation error when start time and end time are equal', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="10:00"
        defaultEndTime="10:00"
        defaultDate="2026-11-03"
      />
    )

    const durationInput = screen.getByLabelText(/duration \(min\)/i)
    expect(durationInput).toHaveValue('')

    const errorMsg = screen.getByTestId('time-error')
    expect(errorMsg).toHaveTextContent('End time must be later than start time.')

    const submitBtn = screen.getByRole('button', { name: /save session/i })
    expect(submitBtn).toBeDisabled()
  })

  it('shows clear validation message when end time is earlier than start time and avoids negative duration', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="11:00"
        defaultEndTime="10:00"
        defaultDate="2026-11-03"
      />
    )

    const durationInput = screen.getByLabelText(/duration \(min\)/i)
    // Duration should not be negative
    expect(durationInput).toHaveValue('')

    const errorMsg = screen.getByTestId('time-error')
    expect(errorMsg).toHaveTextContent('End time cannot be earlier than start time.')

    const submitBtn = screen.getByRole('button', { name: /save session/i })
    expect(submitBtn).toBeDisabled()
  })

  it('clears validation error immediately when user corrects the time', () => {
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="11:00"
        defaultEndTime="10:00"
        defaultDate="2026-11-03"
      />
    )

    expect(screen.getByTestId('time-error')).toBeInTheDocument()

    const endInput = screen.getByLabelText(/end time/i)
    fireEvent.change(endInput, { target: { value: '12:30' } })

    expect(screen.queryByTestId('time-error')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/duration \(min\)/i)).toHaveValue('90')
    expect(screen.getByRole('button', { name: /save session/i })).toBeEnabled()
  })

  it('ensures correct submission payload where duration strictly matches selected times', async () => {
    const handleClose = vi.fn()
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={handleClose}
        defaultStartTime="10:00"
        defaultEndTime="11:30"
        defaultDate="2026-11-03"
      />
    )

    const titleInput = screen.getByLabelText(/topic or focus area/i)
    fireEvent.change(titleInput, { target: { value: 'Dynamic Programming Practice' } })

    const startInput = screen.getByLabelText(/start time/i)
    const endInput = screen.getByLabelText(/end time/i)

    fireEvent.change(startInput, { target: { value: '09:00' } })
    fireEvent.change(endInput, { target: { value: '10:00' } })

    const submitBtn = screen.getByRole('button', { name: /save session/i })
    fireEvent.click(submitBtn)

    expect(mockAddSession).toHaveBeenCalledWith({
      title: 'Dynamic Programming Practice',
      subjectId: 'sub-1',
      date: '2026-11-03',
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      status: 'upcoming',
    })
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('prevents manual text entry into read-only duration field', async () => {
    const user = userEvent.setup()
    render(
      <ScheduleSessionDialog
        open={true}
        onClose={vi.fn()}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
        defaultDate="2026-11-03"
      />
    )

    const durationInput = screen.getByLabelText(/duration \(min\)/i)
    expect(durationInput).toHaveValue('60')

    await user.type(durationInput, '999')
    // Value remains 60 because field is readOnly
    expect(durationInput).toHaveValue('60')
  })
})
