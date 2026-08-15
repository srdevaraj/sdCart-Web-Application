import { request } from '@/lib/api-client'
import type { PageResponse } from '@/types/api'
import type { ReviewRequest, ReviewResponse, UpdateReviewRequest } from '@/types'

export const reviewService = {
  async listForProduct(productPublicId: string, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> {
    return request<PageResponse<ReviewResponse>>({
      method: 'GET',
      url: `/products/${productPublicId}/reviews`,
      params: { page, size },
    })
  },

  async create(payload: ReviewRequest): Promise<ReviewResponse> {
    return request<ReviewResponse>({ method: 'POST', url: '/reviews', data: payload })
  },

  async update(reviewPublicId: string, payload: UpdateReviewRequest): Promise<ReviewResponse> {
    return request<ReviewResponse>({ method: 'PUT', url: `/reviews/${reviewPublicId}`, data: payload })
  },

  async remove(reviewPublicId: string): Promise<void> {
    await request<void>({ method: 'DELETE', url: `/reviews/${reviewPublicId}` })
  },
}
