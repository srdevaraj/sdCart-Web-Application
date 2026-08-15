import { request } from '@/lib/api-client'
import type { PaymentResponse } from '@/types'

export const paymentService = {
  /** Simulates the payment gateway confirmation for a pending order. */
  async payOrder(orderPublicId: string): Promise<PaymentResponse> {
    return request<PaymentResponse>({ method: 'POST', url: `/payments/orders/${orderPublicId}/pay` })
  },
}
