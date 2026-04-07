import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiRequest, ApiError, getErrorMessage } from '../../frontend/src/utils/apiClient'

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('parses successful JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true })
    }))

    await expect(apiRequest('/example')).resolves.toEqual({ success: true })
  })

  it('throws structured errors for validation failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: { get: () => 'application/json' },
      json: async () => ({ detail: 'Latitude must be between -90 and 90' })
    }))

    await expect(apiRequest('/example')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422
    })
  })

  it('adds the auth token when present', async () => {
    localStorage.setItem('token', 'abc123')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true })
    })

    vi.stubGlobal('fetch', fetchMock)
    await apiRequest('/secure', { method: 'POST', body: { hello: 'world' } })

    expect(fetchMock).toHaveBeenCalledWith(
      '/secure',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer abc123'
        })
      })
    )
  })
})

describe('getErrorMessage', () => {
  it('returns a user-friendly network message', () => {
    const error = new ApiError('Network request failed', { isNetworkError: true })
    expect(getErrorMessage(error, 'Fallback')).toMatch(/service is unavailable/i)
  })
})
