import { useMutation } from '@tanstack/react-query'
import { couponService } from '@/services/coupons'

export function useValidateCoupon() {
  return useMutation({
    mutationFn: couponService.validate,
  })
}
