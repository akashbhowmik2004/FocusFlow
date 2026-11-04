import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from './Dropdown'

describe('Dropdown Component', () => {
  it('renders trigger button and initially hides content', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Options</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Edit</DropdownItem>
        </DropdownContent>
      </Dropdown>
    )

    expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument()
  })

  it('opens dropdown menu on trigger click and displays items', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown>
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Manage</DropdownLabel>
          <DropdownItem>Edit Plan</DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive>Delete</DropdownItem>
        </DropdownContent>
      </Dropdown>
    )

    await user.click(screen.getByRole('button', { name: /actions/i }))

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Manage')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /edit plan/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument()
  })

  it('triggers item selection callback and closes menu', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()

    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={handleSelect}>Duplicate</DropdownItem>
        </DropdownContent>
      </Dropdown>
    )

    await user.click(screen.getByRole('button', { name: /menu/i }))
    const item = screen.getByRole('menuitem', { name: /duplicate/i })
    await user.click(item)

    expect(handleSelect).toHaveBeenCalledTimes(1)
    await waitForElementToBeRemoved(() => screen.queryByRole('menuitem', { name: /duplicate/i }))
  })

  it('closes on Escape key press', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownContent>
      </Dropdown>
    )

    await user.click(screen.getByRole('button', { name: /menu/i }))
    expect(screen.getByRole('menuitem', { name: /item 1/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitForElementToBeRemoved(() => screen.queryByRole('menuitem', { name: /item 1/i }))
  })
})
