import type { ProductResponse, ProductSummaryResponse } from '@/types'

/** Collapse a full ProductResponse into the lighter summary shape used by cards. */
export function toProductSummary(product: ProductResponse): ProductSummaryResponse {
  return {
    publicId: product.publicId,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: product.images.find((img) => img.primary)?.imageUrl ?? product.images[0]?.imageUrl ?? null,
    stockQuantity: product.stockQuantity,
  }
}

export function toProductSummaries(products: ProductResponse[]): ProductSummaryResponse[] {
  return products.map(toProductSummary)
}
