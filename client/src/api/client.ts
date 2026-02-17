/**
 * API client: credentials: 'include' so cookies are sent.
 * No token in localStorage or state; session is httpOnly cookie.
 */
import { API_BASE } from '@/lib/env'
import type { ApiError } from '@/types'

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    let detail: string
    try {
      const j = JSON.parse(text) as ApiError
      detail = typeof j.detail === 'string' ? j.detail : (j.detail as { msg?: string }[])?.[0]?.msg ?? text
    } catch {
      detail = text || res.statusText
    }
    throw new Error(detail)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return parseResponse<T>(res)
}

export const authApi = {
  register: (body: { email: string; password: string; full_name?: string }) =>
    api<import('@/types').User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    api<import('@/types').User>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  logout: () => api<{ message: string }>('/auth/logout', { method: 'POST' }),

  /** Returns current user or null if not logged in (401). Does not throw so console stays clean. */
  me: async (): Promise<import('@/types').User | null> => {
    const url = `${API_BASE}/auth/me`
    const res = await fetch(url, { credentials: 'include' })
    if (res.status === 401) return null
    const text = await res.text()
    if (!res.ok) {
      let detail: string
      try {
        const j = JSON.parse(text) as ApiError
        detail = typeof j.detail === 'string' ? j.detail : (j.detail as { msg?: string }[])?.[0]?.msg ?? text
      } catch {
        detail = text || res.statusText
      }
      throw new Error(detail)
    }
    return text ? (JSON.parse(text) as import('@/types').User) : null
  },

  forgotPassword: (email: string) =>
    api<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    }),

  verifyEmail: (token: string) =>
    api<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),
}
