import { request } from '@/lib/api-client'
import type { CouponValidationResponse, ValidateCouponRequest } from '@/types'

export const couponService = {
  async validate(payload: ValidateCouponRequest): Promise<CouponValidationResponse> {
    return request<CouponValidationResponse>({ method: 'POST', url: '/coupons/validate', data: payload })
  },
}
