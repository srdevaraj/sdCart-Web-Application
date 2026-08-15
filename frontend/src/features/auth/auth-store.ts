import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenResponse, UserResponse } from '@/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  /** True while a background token refresh is in flight. */
  isRefreshing: boolean
  setTokens: (tokens: TokenResponse) => void
  setUser: (user: UserResponse | null) => void
  setRefreshing: (refreshing: boolean) => void
  logout: () => void
}

/**
 * Client-side auth state. Tokens live in localStorage so a refresh survives
 * reloads; the backend remains the authority for every request (JWT).
 * Never store passwords or any other secret here.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isRefreshing: false,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: tokens.user,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isRefreshing: false,
        }),
    }),
    {
      name: 'sdcart-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export function isAdminUser(user: UserResponse | null): boolean {
  return user?.roles.includes('ADMIN') ?? false
}
