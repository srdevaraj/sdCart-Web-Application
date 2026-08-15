import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/reviews'
import type { ReviewRequest, UpdateReviewRequest } from '@/types'

export const reviewKeys = {
  forProduct: (productPublicId: string, page: number) => ['reviews', 'product', productPublicId, page] as const,
}

export function useProductReviews(productPublicId: string | undefined, page = 0) {
  return useQuery({
    queryKey: reviewKeys.forProduct(productPublicId ?? '', page),
    queryFn: () => reviewService.listForProduct(productPublicId as string, page),
    enabled: Boolean(productPublicId),
  })
}

export function useCreateReview(productPublicId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReviewRequest) => reviewService.create(payload),
    onSuccess: () => {
      if (productPublicId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(productPublicId, 0) })
      }
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', productPublicId] })
    },
  })
}

export function useUpdateReview(productPublicId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewPublicId, payload }: { reviewPublicId: string; payload: UpdateReviewRequest }) =>
      reviewService.update(reviewPublicId, payload),
    onSuccess: () => {
      if (productPublicId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(productPublicId, 0) })
        queryClient.invalidateQueries({ queryKey: ['products', 'detail', productPublicId] })
      }
    },
  })
}

export function useDeleteReview(productPublicId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewPublicId: string) => reviewService.remove(reviewPublicId),
    onSuccess: () => {
      if (productPublicId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(productPublicId, 0) })
        queryClient.invalidateQueries({ queryKey: ['products', 'detail', productPublicId] })
      }
    },
  })
}
