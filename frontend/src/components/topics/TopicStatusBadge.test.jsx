import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TopicStatusBadge from './TopicStatusBadge'

describe('TopicStatusBadge', () => {
  let originalInnerHeight
  let originalInnerWidth

  beforeEach(() => {
    originalInnerHeight = window.innerHeight
    originalInnerWidth = window.innerWidth
    window.innerHeight = 800
    window.innerWidth = 1280
  })

  afterEach(() => {
    window.innerHeight = originalInnerHeight
    window.innerWidth = originalInnerWidth
  })

  it('renders default Not Started status correctly', () => {
    render(<TopicStatusBadge status="not-started" />)
    expect(screen.getByRole('button', { name: /Learning status: Not Started/i })).toBeInTheDocument()
    expect(screen.getByText('Not Started')).toBeInTheDocument()
  })

  it('renders In Progress status correctly', () => {
    render(<TopicStatusBadge status="in-progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders Completed status correctly', () => {
    render(<TopicStatusBadge status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('opens status menu and allows changing status', () => {
    const handleChange = vi.fn()
    render(<TopicStatusBadge status="not-started" onChangeStatus={handleChange} />)

    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })
    fireEvent.click(badgeBtn)

    expect(screen.getByRole('listbox', { name: /Select learning status/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /In Progress/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Completed/i })).toBeInTheDocument()

    // Select "In Progress"
    fireEvent.click(screen.getByRole('option', { name: /In Progress/i }))
    expect(handleChange).toHaveBeenCalledWith('in-progress')
  })

  it('renders dropdown via React Portal directly into document.body', () => {
    const { container } = render(
      <div id="parent-container" style={{ overflow: 'hidden' }}>
        <TopicStatusBadge status="not-started" />
      </div>
    )

    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })
    fireEvent.click(badgeBtn)

    const listbox = screen.getByRole('listbox', { name: /Select learning status/i })
    expect(listbox).toBeInTheDocument()

    // Verify listbox is rendered in document.body outside #parent-container
    expect(container.querySelector('#parent-container')).not.toContainElement(listbox)
    expect(document.body).toContainElement(listbox)
    expect(listbox).toHaveClass('z-[100]')
  })

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <button type="button" data-testid="outside-button">Outside Element</button>
        <TopicStatusBadge status="not-started" />
      </div>
    )

    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })
    fireEvent.click(badgeBtn)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(badgeBtn).toHaveAttribute('aria-expanded', 'true')

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-button'))
    expect(badgeBtn).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('does not open when disabled', () => {
    render(<TopicStatusBadge status="not-started" disabled={true} />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })
    expect(badgeBtn).toBeDisabled()

    fireEvent.click(badgeBtn)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('handles keyboard navigation: Escape to close and refocus trigger', async () => {
    render(<TopicStatusBadge status="not-started" />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })

    // Open via Enter/Click
    fireEvent.click(badgeBtn)
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(badgeBtn).toHaveAttribute('aria-expanded', 'true')

    // Press Escape on listbox
    fireEvent.keyDown(listbox, { key: 'Escape' })
    expect(badgeBtn).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(badgeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('handles keyboard navigation: ArrowDown / ArrowUp across options', () => {
    render(<TopicStatusBadge status="not-started" />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: Not Started/i })

    // Open via trigger keydown ArrowDown
    fireEvent.keyDown(badgeBtn, { key: 'ArrowDown' })
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)

    // Focus first option and arrow down to second
    options[0].focus()
    expect(document.activeElement).toBe(options[0])

    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[1])

    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[2])

    // Wraps around to first option
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[0])

    // Arrow up wraps to last option
    fireEvent.keyDown(listbox, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(options[2])
  })

  it('positions dropdown intelligently upward when near bottom of viewport', () => {
    render(<TopicStatusBadge status="in-progress" />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: In Progress/i })

    // Mock button bounding rect near bottom of viewport (top: 720, bottom: 748 on 800px viewport)
    vi.spyOn(badgeBtn, 'getBoundingClientRect').mockReturnValue({
      top: 720,
      bottom: 748,
      left: 100,
      right: 200,
      width: 100,
      height: 28,
    })

    fireEvent.click(badgeBtn)
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    // Should position upward (top < rect.top)
    const topStyle = parseInt(listbox.style.top, 10)
    expect(topStyle).toBeLessThan(720)
  })

  it('positions dropdown downward when sufficient space below exists', () => {
    render(<TopicStatusBadge status="in-progress" />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: In Progress/i })

    // Mock button bounding rect near top of viewport (top: 100, bottom: 128 on 800px viewport)
    vi.spyOn(badgeBtn, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 128,
      left: 100,
      right: 200,
      width: 100,
      height: 28,
    })

    fireEvent.click(badgeBtn)
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    // Should position downward (top >= rect.bottom)
    const topStyle = parseInt(listbox.style.top, 10)
    expect(topStyle).toBeGreaterThanOrEqual(128)
  })

  it('keeps dropdown within viewport boundaries on narrow/overflowing screen', () => {
    window.innerWidth = 390 // Mobile width
    render(<TopicStatusBadge status="in-progress" />)
    const badgeBtn = screen.getByRole('button', { name: /Learning status: In Progress/i })

    // Button near right edge of mobile screen (left: 320)
    vi.spyOn(badgeBtn, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 228,
      left: 320,
      right: 380,
      width: 60,
      height: 28,
    })

    fireEvent.click(badgeBtn)
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    // Left coordinate should be clamped so menu doesn't overflow 390px
    const leftStyle = parseInt(listbox.style.left, 10)
    expect(leftStyle).toBeLessThan(320)
    expect(leftStyle).toBeGreaterThanOrEqual(8)
  })
})
