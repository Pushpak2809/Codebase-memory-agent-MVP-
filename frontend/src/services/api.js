const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002'

async function request(path, options = {}) {
  let response
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = isFormData ? (options.headers || {}) : {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options,
    })
  } catch (err) {
    throw new Error(`Could not reach the backend at ${API_BASE_URL}. Make sure the API server is running and VITE_API_BASE_URL is correct.`)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with ${response.status}`)
  }
  return response.json()
}

export const api = {
  baseUrl: API_BASE_URL,
  githubOAuthUrl: `${API_BASE_URL}/auth/github`,
  health: () => request('/health'),
  signin: (email, password) => request('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (email, password) => request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  listReviews: () => request('/reviews'),
  getReview: (reviewId) => request(`/reviews/${reviewId}`),
  listMemory: (query = '') => request(`/memory${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  analyzeDiff: (payload) => request('/reviews/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  uploadDiff: (file) => {
    const body = new FormData()
    body.append('file', file)
    return request('/reviews/upload', { method: 'POST', body })
  },
}