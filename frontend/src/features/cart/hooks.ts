import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-store'
import { cartService } from '@/services/cart'
import { getErrorMessage } from '@/lib/api-client'
import type { AddToCartRequest, UpdateCartItemRequest } from '@/types'

export const cartKeys = {
  all: ['cart'] as const,
}

function useIsAuthed() {
  return useAuthStore((s) => s.isAuthenticated)
}

export function useCart() {
  const isAuthed = useIsAuthed()
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: () => cartService.get(),
    enabled: isAuthed,
    staleTime: 30_000,
  })
}

/** Cart item count for header badges — 0 when signed out. */
export function useCartCount(): number {
  const { data } = useCart()
  return data?.totalQuantity ?? 0
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddToCartRequest) => cartService.addItem(payload),
    // Refetch rather than caching the mutation response: the POST body may omit
    // per-item ids (backend builds the item without persisting it first).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemPublicId, quantity }: UpdateCartItemRequest & { itemPublicId: string }) =>
      cartService.updateItem(itemPublicId, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemPublicId: string) => cartService.removeItem(itemPublicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

/** Shared toast helper for cart mutations. */
export function cartErrorMessage(error: unknown): string {
  return getErrorMessage(error, 'Could not update your cart.')
}
