import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import type {
  BrandRequest,
  CategoryRequest,
  CouponRequest,
  OrderStatus,
  ProductCreateRequest,
  ProductStatus,
  ProductUpdateRequest,
} from '@/types'

export const adminKeys = {
  products: ['admin', 'products'] as const,
  categories: ['admin', 'categories'] as const,
  brands: ['admin', 'brands'] as const,
  users: ['admin', 'users'] as const,
  orders: ['admin', 'orders'] as const,
  payments: ['admin', 'payments'] as const,
  coupons: ['admin', 'coupons'] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useAdminProducts(q?: string, status?: ProductStatus, page = 0, size = 20) {
  return useQuery({
    queryKey: [...adminKeys.products, { q, status, page, size }],
    queryFn: () => adminService.listProducts(q, status, page, size),
    placeholderData: (prev) => prev,
  })
}

export function useAdminUsers(q?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: [...adminKeys.users, { q, page, size }],
    queryFn: () => adminService.listUsers(q, page, size),
    placeholderData: (prev) => prev,
  })
}

export function useAdminOrders(status?: OrderStatus, page = 0, size = 20) {
  return useQuery({
    queryKey: [...adminKeys.orders, { status, page, size }],
    queryFn: () => adminService.listOrders(status, page, size),
    placeholderData: (prev) => prev,
  })
}

export function useAdminPayments(page = 0, size = 20) {
  return useQuery({
    queryKey: [...adminKeys.payments, { page, size }],
    queryFn: () => adminService.listPayments(page, size),
    placeholderData: (prev) => prev,
  })
}

export function useAdminCoupons(page = 0, size = 20) {
  return useQuery({
    queryKey: [...adminKeys.coupons, { page, size }],
    queryFn: () => adminService.listCoupons(page, size),
    placeholderData: (prev) => prev,
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductCreateRequest) => adminService.createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.products }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: ProductUpdateRequest }) =>
      adminService.updateProduct(publicId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.products }),
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: ProductStatus }) =>
      adminService.updateProductStatus(publicId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.products }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => adminService.deleteProduct(publicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.products }),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryRequest) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.categories })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: CategoryRequest }) =>
      adminService.updateCategory(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.categories })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => adminService.deleteCategory(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.categories })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BrandRequest) => adminService.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.brands })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: BrandRequest }) =>
      adminService.updateBrand(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.brands })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => adminService.deleteBrand(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.brands })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, active }: { publicId: string; active: boolean }) =>
      adminService.setUserActive(publicId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: OrderStatus }) =>
      adminService.updateOrderStatus(publicId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.orders }),
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CouponRequest) => adminService.createCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.coupons }),
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: CouponRequest }) =>
      adminService.updateCoupon(publicId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.coupons }),
  })
}

export function useSetCouponActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, active }: { publicId: string; active: boolean }) =>
      adminService.setCouponActive(publicId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.coupons }),
  })
}
