import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-store'
import { orderService } from '@/services/orders'
import { paymentService } from '@/services/payments'
import { cartKeys } from '@/features/cart/hooks'

export const orderKeys = {
  all: ['orders'] as const,
  list: (page: number) => ['orders', 'list', page] as const,
  detail: (publicId: string) => ['orders', 'detail', publicId] as const,
}

export function useOrders(page = 0, size = 10) {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: orderKeys.list(page),
    queryFn: () => orderService.list(page, size),
    enabled: isAuthed,
  })
}

export function useOrder(publicId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(publicId ?? ''),
    queryFn: () => orderService.get(publicId as string),
    enabled: Boolean(publicId),
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.publicId), order)
      // Checkout consumes the cart.
      queryClient.removeQueries({ queryKey: cartKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => orderService.cancel(publicId),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.publicId), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function usePayOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderPublicId: string) => paymentService.payOrder(orderPublicId),
    onSuccess: (_payment, orderPublicId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderPublicId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
