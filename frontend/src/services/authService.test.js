import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('./apiClient', () => ({
  request: requestMock,
}))

const { authService } = await import('./authService')

describe('authService session verification', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('deduplicates concurrent session verification requests', async () => {
    let resolveRequest
    requestMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const first = authService.getMe()
    const second = authService.getMe()
    resolveRequest({ user: { id: 'user-1' } })

    await expect(Promise.all([first, second])).resolves.toEqual([
      { user: { id: 'user-1' } },
      { user: { id: 'user-1' } },
    ])
    expect(requestMock).toHaveBeenCalledTimes(1)
  })
})
