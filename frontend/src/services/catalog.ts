import { request } from '@/lib/api-client'
import type { BrandResponse, CategoryResponse } from '@/types'

export const catalogService = {
  async getCategories(tree = false): Promise<CategoryResponse[]> {
    return request<CategoryResponse[]>({ method: 'GET', url: '/categories', params: { tree } })
  },

  async getCategory(publicId: string): Promise<CategoryResponse> {
    return request<CategoryResponse>({ method: 'GET', url: `/categories/${publicId}` })
  },

  async getBrands(): Promise<BrandResponse[]> {
    return request<BrandResponse[]>({ method: 'GET', url: '/brands' })
  },

  async getBrand(publicId: string): Promise<BrandResponse> {
    return request<BrandResponse>({ method: 'GET', url: `/brands/${publicId}` })
  },
}
