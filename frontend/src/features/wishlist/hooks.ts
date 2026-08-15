import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-store'
import { wishlistService } from '@/services/wishlist'

export const wishlistKeys = {
  all: ['wishlist'] as const,
}

export function useWishlist() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: () => wishlistService.get(),
    enabled: isAuthed,
    staleTime: 30_000,
  })
}

export function useWishlistProductIds(): Set<string> {
  const { data } = useWishlist()
  return new Set((data?.items ?? []).map((item) => item.product.publicId))
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => wishlistService.addItem(productId),
    // Refetch after mutations: the mutation responses may omit item ids or
    // include just-removed entries, so the GET response is authoritative.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productPublicId: string) => wishlistService.removeItem(productPublicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })
}
