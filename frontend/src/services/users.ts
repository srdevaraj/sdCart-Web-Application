import { request } from '@/lib/api-client'
import type { ChangePasswordRequest, UpdateProfileRequest, UserResponse } from '@/types'

export const userService = {
  async me(): Promise<UserResponse> {
    return request<UserResponse>({ method: 'GET', url: '/users/me' })
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<UserResponse> {
    return request<UserResponse>({ method: 'PUT', url: '/users/me', data: payload })
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await request<void>({ method: 'PUT', url: '/users/me/password', data: payload })
  },
}
