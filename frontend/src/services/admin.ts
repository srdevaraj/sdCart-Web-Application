import { request } from '@/lib/api-client'
import type { PageResponse } from '@/types/api'
import type {
  BrandRequest,
  BrandResponse,
  CategoryRequest,
  CategoryResponse,
  CouponActiveRequest,
  CouponRequest,
  CouponResponse,
  OrderResponse,
  OrderStatus,
  OrderStatusUpdateRequest,
  PaymentResponse,
  ProductCreateRequest,
  ProductResponse,
  ProductStatus,
  ProductStatusRequest,
  ProductUpdateRequest,
  UserResponse,
  UserStatusRequest,
} from '@/types'

export const adminService = {
  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  async listProducts(q?: string, status?: ProductStatus, page = 0, size = 20): Promise<PageResponse<ProductResponse>> {
    return request<PageResponse<ProductResponse>>({
      method: 'GET',
      url: '/admin/products',
      params: { q, status, page, size },
    })
  },

  async getProduct(publicId: string): Promise<ProductResponse> {
    return request<ProductResponse>({ method: 'GET', url: `/admin/products/${publicId}` })
  },

  async createProduct(payload: ProductCreateRequest): Promise<ProductResponse> {
    return request<ProductResponse>({ method: 'POST', url: '/admin/products', data: payload })
  },

  async updateProduct(publicId: string, payload: ProductUpdateRequest): Promise<ProductResponse> {
    return request<ProductResponse>({ method: 'PUT', url: `/admin/products/${publicId}`, data: payload })
  },

  async updateProductStatus(publicId: string, status: ProductStatus): Promise<ProductResponse> {
    return request<ProductResponse>({
      method: 'PATCH',
      url: `/admin/products/${publicId}/status`,
      data: { status } satisfies ProductStatusRequest,
    })
  },

  async deleteProduct(publicId: string): Promise<void> {
    await request<void>({ method: 'DELETE', url: `/admin/products/${publicId}` })
  },

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  async createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
    return request<CategoryResponse>({ method: 'POST', url: '/admin/categories', data: payload })
  },

  async updateCategory(publicId: string, payload: CategoryRequest): Promise<CategoryResponse> {
    return request<CategoryResponse>({ method: 'PUT', url: `/admin/categories/${publicId}`, data: payload })
  },

  async deleteCategory(publicId: string): Promise<void> {
    await request<void>({ method: 'DELETE', url: `/admin/categories/${publicId}` })
  },

  // -------------------------------------------------------------------------
  // Brands
  // -------------------------------------------------------------------------
  async createBrand(payload: BrandRequest): Promise<BrandResponse> {
    return request<BrandResponse>({ method: 'POST', url: '/admin/brands', data: payload })
  },

  async updateBrand(publicId: string, payload: BrandRequest): Promise<BrandResponse> {
    return request<BrandResponse>({ method: 'PUT', url: `/admin/brands/${publicId}`, data: payload })
  },

  async deleteBrand(publicId: string): Promise<void> {
    await request<void>({ method: 'DELETE', url: `/admin/brands/${publicId}` })
  },

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  async listUsers(q?: string, page = 0, size = 20): Promise<PageResponse<UserResponse>> {
    return request<PageResponse<UserResponse>>({ method: 'GET', url: '/admin/users', params: { q, page, size } })
  },

  async setUserActive(publicId: string, active: boolean): Promise<UserResponse> {
    return request<UserResponse>({
      method: 'PATCH',
      url: `/admin/users/${publicId}/status`,
      data: { active } satisfies UserStatusRequest,
    })
  },

  // -------------------------------------------------------------------------
  // Orders
  // -------------------------------------------------------------------------
  async listOrders(status?: OrderStatus, page = 0, size = 20): Promise<PageResponse<OrderResponse>> {
    return request<PageResponse<OrderResponse>>({
      method: 'GET',
      url: '/admin/orders',
      params: { status, page, size },
    })
  },

  async updateOrderStatus(publicId: string, status: OrderStatus): Promise<OrderResponse> {
    return request<OrderResponse>({
      method: 'PATCH',
      url: `/admin/orders/${publicId}/status`,
      data: { status } satisfies OrderStatusUpdateRequest,
    })
  },

  // -------------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------------
  async listPayments(page = 0, size = 20): Promise<PageResponse<PaymentResponse>> {
    return request<PageResponse<PaymentResponse>>({ method: 'GET', url: '/admin/payments', params: { page, size } })
  },

  // -------------------------------------------------------------------------
  // Coupons
  // -------------------------------------------------------------------------
  async listCoupons(page = 0, size = 20): Promise<PageResponse<CouponResponse>> {
    return request<PageResponse<CouponResponse>>({ method: 'GET', url: '/admin/coupons', params: { page, size } })
  },

  async createCoupon(payload: CouponRequest): Promise<CouponResponse> {
    return request<CouponResponse>({ method: 'POST', url: '/admin/coupons', data: payload })
  },

  async updateCoupon(publicId: string, payload: CouponRequest): Promise<CouponResponse> {
    return request<CouponResponse>({ method: 'PUT', url: `/admin/coupons/${publicId}`, data: payload })
  },

  async setCouponActive(publicId: string, active: boolean): Promise<CouponResponse> {
    return request<CouponResponse>({
      method: 'PATCH',
      url: `/admin/coupons/${publicId}/active`,
      data: { active } satisfies CouponActiveRequest,
    })
  },
}
