import { request } from '@/lib/api-client'
import type { PageResponse } from '@/types/api'
import type { ProductQuery, ProductResponse } from '@/types'

export const productService = {
  /**
   * Public catalog search/filter. `category` and `brand` are SLUGS
   * (matching the backend); pagination is zero-based and server-side.
   */
  async list(params: ProductQuery): Promise<PageResponse<ProductResponse>> {
    const query: Record<string, string | number | boolean | undefined> = {
      page: params.page,
      size: params.size,
      category: params.category,
      brand: params.brand,
      q: params.q,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      featured: params.featured,
      sort: params.sort,
    }
    return request<PageResponse<ProductResponse>>({ method: 'GET', url: '/products', params: query })
  },

  async get(publicId: string): Promise<ProductResponse> {
    return request<ProductResponse>({ method: 'GET', url: `/products/${publicId}` })
  },
}
