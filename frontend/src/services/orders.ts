import { request } from '@/lib/api-client'
import type { PageResponse } from '@/types/api'
import type { CreateOrderRequest, OrderResponse } from '@/types'

export const orderService = {
  async placeOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    return request<OrderResponse>({ method: 'POST', url: '/orders', data: payload })
  },

  async list(page = 0, size = 10): Promise<PageResponse<OrderResponse>> {
    return request<PageResponse<OrderResponse>>({ method: 'GET', url: '/orders', params: { page, size } })
  },

  async get(publicId: string): Promise<OrderResponse> {
    return request<OrderResponse>({ method: 'GET', url: `/orders/${publicId}` })
  },

  async cancel(publicId: string): Promise<OrderResponse> {
    return request<OrderResponse>({ method: 'POST', url: `/orders/${publicId}/cancel` })
  },

  async refund(publicId: string): Promise<OrderResponse> {
    return request<OrderResponse>({ method: 'POST', url: `/orders/${publicId}/refund` })
  },
}