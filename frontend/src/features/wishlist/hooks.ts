import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/auth-store'
import { wishlistService } from '@/services/wishlist'
import { getErrorMessage } from '@/lib/api-client'

export const wishlistKeys = {
  all: ['wishlist'] as const,
  add: ['wishlist', 'add'] as const,
  remove: ['wishlist', 'remove'] as const,
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
  return useMemo(() => new Set((data?.items ?? []).map((item) => item.product.publicId)), [data?.items])
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: wishlistKeys.add,
    mutationFn: (productId: string) => wishlistService.addItem(productId),
    // Refetch after mutations: the mutation responses may omit item ids or
    // include just-removed entries, so the GET response is authoritative.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: wishlistKeys.remove,
    mutationFn: (productPublicId: string) => wishlistService.removeItem(productPublicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
  })
}

export function useIsWishlistMutating(productId?: string): boolean {
  const mutations = useMutationState({
    filters: {
      predicate: (mutation) => {
        const key = mutation.options.mutationKey
        const isWishlist = Array.isArray(key) && key[0] === 'wishlist'
        if (!isWishlist) return false
        if (mutation.state.status !== 'pending') return false
        if (!productId) return true
        return mutation.state.variables === productId
      },
    },
  })
  return mutations.length > 0
}

export function useWishlistToggle(productId?: string) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const wishlistIds = useWishlistProductIds()
  const isWishlisted = productId ? wishlistIds.has(productId) : false
  const isPending = useIsWishlistMutating(productId)

  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  const toggleWishlist = useCallback(() => {
    if (!productId) return
    if (!isAuthed) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (isPending) return

    if (isWishlisted) {
      removeFromWishlist.mutate(productId, {
        onSuccess: () => toast.success('Removed from wishlist'),
        onError: (error) => toast.error(getErrorMessage(error, 'Could not remove from wishlist')),
      })
    } else {
      addToWishlist.mutate(productId, {
        onSuccess: () => toast.success('Added to wishlist'),
        onError: (error) => toast.error(getErrorMessage(error, 'Could not add to wishlist')),
      })
    }
  }, [productId, isAuthed, isPending, isWishlisted, navigate, location.pathname, removeFromWishlist, addToWishlist])

  return {
    isWishlisted,
    isPending,
    toggleWishlist,
  }
}

