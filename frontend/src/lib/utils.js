import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export const subjectColors = [
  { name: 'Blue', value: '#3b82f6', bg: '#dbeafe' },
  { name: 'Purple', value: '#8b5cf6', bg: '#ede9fe' },
  { name: 'Green', value: '#22c55e', bg: '#dcfce7' },
  { name: 'Orange', value: '#f97316', bg: '#ffedd5' },
  { name: 'Pink', value: '#ec4899', bg: '#fce7f3' },
  { name: 'Teal', value: '#14b8a6', bg: '#ccfbf1' },
  { name: 'Red', value: '#ef4444', bg: '#fee2e2' },
  { name: 'Yellow', value: '#eab308', bg: '#fef9c3' },
]
