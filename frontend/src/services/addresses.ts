import { request } from '@/lib/api-client'
import type { AddressRequest, AddressResponse } from '@/types'

export const addressService = {
  async list(): Promise<AddressResponse[]> {
    return request<AddressResponse[]>({ method: 'GET', url: '/addresses' })
  },

  async create(payload: AddressRequest): Promise<AddressResponse> {
    return request<AddressResponse>({ method: 'POST', url: '/addresses', data: payload })
  },

  async update(publicId: string, payload: AddressRequest): Promise<AddressResponse> {
    return request<AddressResponse>({ method: 'PUT', url: `/addresses/${publicId}`, data: payload })
  },

  async remove(publicId: string): Promise<void> {
    await request<void>({ method: 'DELETE', url: `/addresses/${publicId}` })
  },

  async setDefault(publicId: string): Promise<AddressResponse> {
    return request<AddressResponse>({ method: 'PUT', url: `/addresses/${publicId}/default` })
  },
}
