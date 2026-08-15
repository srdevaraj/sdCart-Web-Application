import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ProductGrid } from '@/components/product/product-grid'
import { ErrorState } from '@/components/common/error-state'
import { toProductSummaries } from '@/utils/product'
import type { PageResponse } from '@/types/api'
import type { ProductResponse } from '@/types'

interface ProductSectionProps {
  title: string
  subtitle?: string
  viewAllTo?: string
  query: {
    data?: PageResponse<ProductResponse>
    isPending: boolean
    isError: boolean
    refetch?: () => void
  }
}

export function ProductSection({ title, subtitle, viewAllTo, query }: ProductSectionProps) {
  return (
    <section aria-labelledby={title} className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={title} className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      {query.isError ? (
        <ErrorState onRetry={query.refetch} message="We couldn't load these products." />
      ) : (
        <ProductGrid
          products={toProductSummaries(query.data?.content ?? [])}
          loading={query.isPending}
          skeletonCount={4}
        />
      )}
    </section>
  )
}
