const DEFAULT_HEADERS = {
  Accept: 'application/json'
}

export class ApiError extends Error {
  constructor(message, { status = 500, data = null, isNetworkError = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.isNetworkError = isNetworkError
  }
}

function buildHeaders(headers = {}, body) {
  const mergedHeaders = { ...DEFAULT_HEADERS, ...headers }
  const token = localStorage.getItem('token')

  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`
  }

  if (body && !(body instanceof FormData) && !mergedHeaders['Content-Type']) {
    mergedHeaders['Content-Type'] = 'application/json'
  }

  return mergedHeaders
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (isJson && (data.message || data.detail)) ||
      response.statusText ||
      'Request failed'

    throw new ApiError(message, { status: response.status, data })
  }

  return data
}

export async function apiRequest(url, options = {}) {
  const { body, headers, ...rest } = options

  try {
    const response = await fetch(url, {
      ...rest,
      headers: buildHeaders(headers, body),
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
    })

    return await parseResponse(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError('Network request failed', { isNetworkError: true })
  }
}

export function getErrorMessage(error, fallbackMessage) {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'The service is unavailable right now. Please check your connection and try again.'
    }

    if (error.status >= 500) {
      return 'The service hit an internal error. Please try again in a moment.'
    }

    if (error.status === 422) {
      return error.message || 'The request data is invalid. Please review the form and try again.'
    }

    return error.message || fallbackMessage
  }

  return fallbackMessage
}
