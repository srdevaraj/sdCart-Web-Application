/**
 * Consistent success envelope returned by every 2xx backend response.
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

/**
 * Consistent pagination envelope used across all list endpoints.
 */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

/**
 * Consistent error envelope for every non-2xx API response.
 */
export interface FieldViolation {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: boolean
  message: string
  status: number
  path: string
  timestamp: string
  errors?: FieldViolation[]
}

/** Standard Spring Data pagination query params (page is zero-based). */
export interface PageParams {
  page?: number
  size?: number
  sort?: string
}
