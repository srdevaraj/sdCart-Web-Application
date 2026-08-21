/**
 * Domain types mirroring the sdCart backend DTOs
 * (see the dto packages under backend/src/main/java/com/sdcart).
 * Keep these in sync with the API — the backend is the source of truth.
 */

// ---------------------------------------------------------------------------
// Enums (backend exposes these as JSON string enums)
// ---------------------------------------------------------------------------

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY'
export type CouponType = 'PERCENTAGE' | 'FIXED'
export type RoleName = 'ADMIN' | 'USER'

export const PRODUCT_STATUSES: ProductStatus[] = ['ACTIVE', 'INACTIVE', 'DRAFT']
export const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
export const PAYMENT_METHODS: PaymentMethod[] = ['CARD', 'PAYPAL', 'CASH_ON_DELIVERY']

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserResponse {
  publicId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  roles: RoleName[]
  active: boolean
  emailVerified: boolean
  createdAt: string
}

export interface UserSummaryResponse {
  publicId: string
  firstName: string
  lastName: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export interface CategorySummaryResponse {
  publicId: string
  name: string
  slug: string
}

export interface CategoryResponse {
  publicId: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  active: boolean
  parent: CategorySummaryResponse | null
  children: CategoryResponse[]
}

export interface CategoryRequest {
  name: string
  slug?: string
  description?: string
  parentId?: string
  imageUrl?: string
  sortOrder?: number
  active?: boolean
}

export interface BrandSummaryResponse {
  publicId: string
  name: string
  slug: string
}

export interface BrandResponse {
  publicId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  active: boolean
}

export interface BrandRequest {
  name: string
  slug?: string
  description?: string
  logoUrl?: string
  active?: boolean
}

export interface ProductImageResponse {
  publicId: string
  imageUrl: string
  altText: string | null
  primary: boolean
  sortOrder: number
}

export interface ProductImageRequest {
  imageUrl: string
  altText?: string
  primary?: boolean
  sortOrder?: number
}

export interface ProductSpecificationResponse {
  name: string
  value: string
}

export interface ProductSpecificationRequest {
  name: string
  value: string
  sortOrder?: number
}

export interface ProductResponse {
  publicId: string
  name: string
  slug: string
  sku: string | null
  shortDescription: string | null
  description: string | null
  price: string
  compareAtPrice: string | null
  stockQuantity: number
  status: ProductStatus
  featured: boolean
  bannerImage?: string | null
  averageRating: number
  reviewCount: number
  category: CategorySummaryResponse | null
  brand: BrandSummaryResponse | null
  images: ProductImageResponse[]
  specifications: ProductSpecificationResponse[]
  createdAt: string
}

export interface ProductSummaryResponse {
  publicId: string
  name: string
  slug: string
  price: string
  imageUrl: string | null
  stockQuantity: number
}

export interface ProductCreateRequest {
  name: string
  slug?: string
  sku?: string
  shortDescription?: string
  description?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  stockQuantity?: number
  status?: ProductStatus
  featured?: boolean
  bannerImage?: string
  categoryId?: string
  brandId?: string
  images?: ProductImageRequest[]
  specifications?: ProductSpecificationRequest[]
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>

export interface ProductQuery {
  category?: string
  brand?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  page?: number
  size?: number
  sort?: string
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface CartItemResponse {
  publicId: string
  product: ProductSummaryResponse
  quantity: number
  unitPrice: string
  subtotal: string
}

export interface CartResponse {
  publicId: string
  items: CartItemResponse[]
  totalQuantity: number
  totalAmount: string
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export interface WishlistItemResponse {
  publicId: string
  product: ProductSummaryResponse
  addedAt: string
}

export interface WishlistResponse {
  publicId: string
  items: WishlistItemResponse[]
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export interface AddressResponse {
  publicId: string
  label: string
  recipientName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string | null
  country: string
  isDefault: boolean
}

export interface AddressRequest {
  label: string
  recipientName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  isDefault?: boolean
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderItemResponse {
  publicId: string
  productId: string | null
  productName: string
  productImage: string | null
  unitPrice: string
  quantity: number
  subtotal: string
}

export interface ShippingAddressResponse {
  recipientName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string | null
  country: string
}

export interface PaymentSummaryResponse {
  publicId: string
  transactionId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: string
}

export interface OrderResponse {
  publicId: string
  orderNumber: string
  status: OrderStatus
  items: OrderItemResponse[]
  itemsSubtotal: string
  discountAmount: string
  shippingFee: string
  taxAmount: string
  totalAmount: string
  couponCode: string | null
  shippingAddress: ShippingAddressResponse
  payment: PaymentSummaryResponse | null
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  addressId: string
  paymentMethod: PaymentMethod
  couponCode?: string
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface PaymentResponse {
  publicId: string
  orderPublicId: string
  transactionId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: string
  currency: string
  gateway: string
  gatewayReference: string | null
  paidAt: string | null
  failureReason: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface ReviewResponse {
  publicId: string
  user: UserSummaryResponse
  productId: string
  rating: number
  title: string | null
  comment: string | null
  approved: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewRequest {
  productId: string
  rating: number
  title?: string
  comment?: string
}

export interface UpdateReviewRequest {
  rating: number
  title?: string
  comment?: string
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface CouponValidationResponse {
  valid: boolean
  code: string
  type: CouponType
  discountAmount: string
  message: string
}

export interface ValidateCouponRequest {
  code: string
  orderAmount: number
}

export interface CouponResponse {
  publicId: string
  code: string
  type: CouponType
  value: string
  minOrderAmount: string | null
  maxDiscountAmount: string | null
  maxUsages: number
  usedCount: number
  perUserLimit: number
  validFrom: string
  validUntil: string
  active: boolean
  description: string | null
}

export interface CouponRequest {
  code: string
  type: CouponType
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  maxUsages?: number
  perUserLimit?: number
  validFrom: string
  validUntil: string
  active?: boolean
  description?: string
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface UserStatusRequest {
  active: boolean
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus
}

export interface ProductStatusRequest {
  status: ProductStatus
}

export interface CouponActiveRequest {
  active: boolean
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Credit / Debit Card',
  PAYPAL: 'PayPal',
  CASH_ON_DELIVERY: 'Cash on Delivery',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DRAFT: 'Draft',
}

// ---------------------------------------------------------------------------
// Dashboard Analytics
// ---------------------------------------------------------------------------

/** Mirrors {@code YearlyRevenueDto} from the backend. */
export interface YearlyRevenue {
  year: number
  totalRevenue: string
}

/** Mirrors {@code MonthlyRevenueDto} from the backend. */
export interface MonthlyRevenue {
  month: number
  monthName: string
  revenue: string
  percentOfYear: number
}

/**
 * Mirrors {@code StatusCountDto} from the backend.
 * Used for both order-status and payment-status summaries.
 */
export interface StatusCount {
  status: string
  count: number
  percentage: number
}
