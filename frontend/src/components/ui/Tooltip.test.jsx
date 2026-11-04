import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip'

describe('Tooltip Component', () => {
  it('renders trigger element and keeps content hidden initially', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful info</TooltipContent>
      </Tooltip>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('displays tooltip immediately on focus for keyboard accessibility', async () => {
    render(
      <Tooltip>
        <TooltipTrigger>Focus target</TooltipTrigger>
        <TooltipContent>Accessible tip</TooltipContent>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus target')
    fireEvent.focus(trigger)

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Accessible tip')).toBeInTheDocument()

    fireEvent.blur(trigger)
    await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'))
  })
})
