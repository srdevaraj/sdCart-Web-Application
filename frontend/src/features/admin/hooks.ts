import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { dashboardService } from '@/services/dashboard'
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
  bannerProducts: ['admin', 'banner-products'] as const,
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

export function useAdminBannerProducts() {
  return useQuery({
    queryKey: adminKeys.bannerProducts,
    queryFn: () => adminService.listBannerProducts(),
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

export function useAdminOrder(publicId: string | undefined) {
  return useQuery({
    queryKey: [...adminKeys.orders, 'detail', publicId ?? ''],
    queryFn: () => adminService.getOrder(publicId as string),
    enabled: Boolean(publicId),
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
    mutationFn: (input: { payload: ProductCreateRequest; files?: File[]; altTexts?: string[] }) => {
      if (input.files && input.files.length > 0) {
        return adminService.createProductWithImages(input.payload, input.files, input.altTexts ?? [])
      }
      return adminService.createProduct(input.payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products })
      queryClient.invalidateQueries({ queryKey: adminKeys.bannerProducts })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      publicId: string
      payload: ProductUpdateRequest
      files?: File[]
      altTexts?: string[]
    }) => {
      if (input.files && input.files.length > 0) {
        return adminService.updateProductWithImages(input.publicId, input.payload, input.files, input.altTexts ?? [])
      }
      return adminService.updateProduct(input.publicId, input.payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products })
      queryClient.invalidateQueries({ queryKey: adminKeys.bannerProducts })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: ProductStatus }) =>
      adminService.updateProductStatus(publicId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products })
      queryClient.invalidateQueries({ queryKey: adminKeys.bannerProducts })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => adminService.deleteProduct(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products })
      queryClient.invalidateQueries({ queryKey: adminKeys.bannerProducts })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
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

export function useProcessRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => adminService.processRefund(publicId),
    onSuccess: (order) => {
      queryClient.setQueryData([...adminKeys.orders, 'detail', order.publicId], order)
      queryClient.invalidateQueries({ queryKey: adminKeys.orders })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
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

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => adminService.uploadImage(file),
  })
}

// ---------------------------------------------------------------------------
// Dashboard analytics — read-only hooks
// ---------------------------------------------------------------------------

export function useRevenueYearly(years = 5) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', 'yearly', years],
    queryFn: () => dashboardService.getRevenueYearly(years),
    staleTime: 5 * 60 * 1000, // 5 min — aggregate data changes infrequently
  })
}

export function useRevenueMonthly(year: number | null) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', 'monthly', year],
    queryFn: () => dashboardService.getRevenueMonthly(year as number),
    enabled: year !== null,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePaymentStatusSummary() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'payments', 'status-summary'],
    queryFn: () => dashboardService.getPaymentStatusSummary(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrderStatusSummary() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'orders', 'status-summary'],
    queryFn: () => dashboardService.getOrderStatusSummary(),
    staleTime: 5 * 60 * 1000,
  })
}
