import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/auth-store'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type { TokenResponse } from '@/types'

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

/** Send the user to the login page after an unrecoverable auth failure. */
export function redirectToLogin(): void {
  if (import.meta.env.MODE === 'test') return
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// ---------------------------------------------------------------------------
// Request interceptor: attach the access token & clean FormData headers.
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// ---------------------------------------------------------------------------
// Response interceptor: single-flight token refresh on 401.
// ---------------------------------------------------------------------------

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

function flushQueue(token: string | null): void {
  pendingQueue.forEach((resolve) => resolve(token))
  pendingQueue = []
}

async function tryRefreshToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState()
  if (!refreshToken) return null
  try {
    const response = await axios.post<ApiResponse<TokenResponse>>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
    )
    const tokens = response.data.data
    setTokens(tokens)
    return tokens.accessToken
  } catch {
    logout()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const isAuthRoute = original?.url?.startsWith('/auth/') ?? false

    // Only auto-refresh once per request, never for the auth endpoints
    // themselves, and only for real 401 responses.
    if (status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // A refresh is already running; queue this request until it resolves.
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          } else {
            reject(error)
          }
        })
      })
    }

    original._retry = true
    isRefreshing = true
    useAuthStore.getState().setRefreshing(true)

    try {
      const newToken = await tryRefreshToken()
      flushQueue(newToken)
      if (!newToken) {
        redirectToLogin()
        return Promise.reject(error)
      }
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } finally {
      isRefreshing = false
      useAuthStore.getState().setRefreshing(false)
    }
  },
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Unwrap the backend `{success, message, data}` envelope. */
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data
}

/** Extract a human-readable message from any axios error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'The request timed out. Please check your network connection and try again.'
    }
    if (error.message === 'Network Error') return 'Cannot reach the server. Check your connection and try again.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/** Execute a request and unwrap the envelope, normalizing errors. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config)
  return response.data.data
}
