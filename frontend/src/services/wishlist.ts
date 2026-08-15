import { request } from '@/lib/api-client'
import type { WishlistResponse } from '@/types'

export const wishlistService = {
  async get(): Promise<WishlistResponse> {
    return request<WishlistResponse>({ method: 'GET', url: '/wishlist' })
  },

  async addItem(productId: string): Promise<WishlistResponse> {
    return request<WishlistResponse>({
      method: 'POST',
      url: '/wishlist/items',
      data: { productId },
    })
  },

  async removeItem(productPublicId: string): Promise<WishlistResponse> {
    return request<WishlistResponse>({ method: 'DELETE', url: `/wishlist/items/${productPublicId}` })
  },
}
