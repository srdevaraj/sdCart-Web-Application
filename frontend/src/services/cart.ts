import { request } from '@/lib/api-client'
import type { AddToCartRequest, CartResponse, UpdateCartItemRequest } from '@/types'

export const cartService = {
  async get(): Promise<CartResponse> {
    return request<CartResponse>({ method: 'GET', url: '/cart' })
  },

  async addItem(payload: AddToCartRequest): Promise<CartResponse> {
    return request<CartResponse>({ method: 'POST', url: '/cart/items', data: payload })
  },

  async updateItem(itemPublicId: string, payload: UpdateCartItemRequest): Promise<CartResponse> {
    return request<CartResponse>({ method: 'PUT', url: `/cart/items/${itemPublicId}`, data: payload })
  },

  async removeItem(itemPublicId: string): Promise<CartResponse> {
    return request<CartResponse>({ method: 'DELETE', url: `/cart/items/${itemPublicId}` })
  },

  async clear(): Promise<CartResponse> {
    return request<CartResponse>({ method: 'DELETE', url: '/cart' })
  },
}
