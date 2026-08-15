import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/product/product-card'
import { cn } from '@/lib/utils'
import type { ProductSummaryResponse } from '@/types'

interface ProductGridProps {
  products: ProductSummaryResponse[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export function ProductGrid({ products, loading, skeletonCount = 8, className }: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.publicId} product={product} />
      ))}
    </div>
  )
}
