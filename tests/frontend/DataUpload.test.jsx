import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DataUpload from '../../frontend/src/components/DataUpload'

// Mock config and apiClient so tests don't need a running server
vi.mock('../../frontend/src/config', () => ({
  API_BASE_INTEGRATOR: 'http://localhost:8081'
}))

vi.mock('../../frontend/src/utils/apiClient', () => ({
  apiRequest: vi.fn(),
  getErrorMessage: vi.fn((error, fallback) => error?.message || fallback),
  ApiError: class ApiError extends Error {
    constructor(message, { status = 500, isNetworkError = false } = {}) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.isNetworkError = isNetworkError
    }
  }
}))

// Silence react-toastify in tests
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}))

import { apiRequest } from '../../frontend/src/utils/apiClient'
import { toast } from 'react-toastify'

function makeFile(name, size, type = 'text/csv') {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('DataUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the upload form', () => {
    render(<DataUpload />)
    expect(screen.getByText('Data Upload')).toBeTruthy()
    expect(screen.getByText('Upload Data')).toBeTruthy()
  })

  it('uploads a valid CSV file and shows success', async () => {
    apiRequest.mockResolvedValue({ success: true, recordsProcessed: 42 })

    render(<DataUpload />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [makeFile('data.csv', 1024)] } })

    fireEvent.click(screen.getByText('Upload Data'))

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledTimes(1)
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('42')
      )
    })
  })

  it('rejects a file that exceeds 100 MB', () => {
    render(<DataUpload />)

    const oversizedFile = makeFile('big.csv', 101 * 1024 * 1024)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [oversizedFile] } })

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('100 MB')
    )
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('rejects a file with an unsupported extension', () => {
    render(<DataUpload />)

    const badFile = makeFile('data.xlsx', 512, 'application/vnd.ms-excel')
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('CSV, JSON, or GeoJSON')
    )
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows a service error message when the upload request fails', async () => {
    const { ApiError } = await import('../../frontend/src/utils/apiClient')
    apiRequest.mockRejectedValue(new ApiError('Server error', { status: 500 }))

    render(<DataUpload />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [makeFile('data.json', 512, 'application/json')] } })

    fireEvent.click(screen.getByText('Upload Data'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('disables the upload button while uploading', async () => {
    let resolve
    apiRequest.mockReturnValue(new Promise((r) => { resolve = r }))

    render(<DataUpload />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [makeFile('data.csv', 512)] } })

    const button = screen.getByText('Upload Data')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeTruthy()
    })

    resolve({ success: true, recordsProcessed: 0 })
  })
})
