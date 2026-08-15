import { apiClient, request } from '@/lib/api-client'
import { useAuthStore } from '@/features/auth/auth-store'
import type { LoginRequest, RegisterRequest, TokenResponse } from '@/types'

export const authService = {
  async register(payload: RegisterRequest): Promise<TokenResponse> {
    return request<TokenResponse>({ method: 'POST', url: '/auth/register', data: payload })
  },

  async login(payload: LoginRequest): Promise<TokenResponse> {
    return request<TokenResponse>({ method: 'POST', url: '/auth/login', data: payload })
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    return request<TokenResponse>({ method: 'POST', url: '/auth/refresh', data: { refreshToken } })
  },

  /**
   * Logout revokes the refresh token server-side so it cannot be replayed;
   * the client also discards its local copy. Best-effort: local sign-out
   * still proceeds if the network call fails.
   */
  async logout(): Promise<void> {
    const refreshToken = useAuthStore.getState().refreshToken
    await apiClient
      .post('/auth/logout', refreshToken ? { refreshToken } : undefined)
      .catch(() => undefined)
  },
}
