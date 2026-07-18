const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export class AuthError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'AuthError'
  }
}

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  })

  let result = {}
  try {
    result = await response.json()
  } catch (_error) {
    result = {}
  }

  if (response.status === 401) {
    throw new AuthError()
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed')
  }

  return result
}
