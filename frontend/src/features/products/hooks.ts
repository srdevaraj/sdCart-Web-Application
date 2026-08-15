import { useQuery } from '@tanstack/react-query'
import { catalogService } from '@/services/catalog'
import { productService } from '@/services/products'
import type { ProductQuery } from '@/types'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductQuery) => ['products', 'list', params] as const,
  detail: (publicId: string) => ['products', 'detail', publicId] as const,
}

export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(publicId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(publicId ?? ''),
    queryFn: () => productService.get(publicId as string),
    enabled: Boolean(publicId),
  })
}

export const categoryKeys = {
  all: ['categories'] as const,
}

export function useCategories(tree = false) {
  return useQuery({
    queryKey: [...categoryKeys.all, { tree }],
    queryFn: () => catalogService.getCategories(tree),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategory(publicId: string | undefined) {
  return useQuery({
    queryKey: ['categories', publicId],
    queryFn: () => catalogService.getCategory(publicId as string),
    enabled: Boolean(publicId),
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => catalogService.getBrands(),
    staleTime: 5 * 60 * 1000,
  })
}
