import { Link } from 'react-router-dom'
import { ArrowRight, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { SectionHeading } from '@/components/common/section-heading'
import { MotionReveal } from '@/components/common/motion'
import { ProductCard } from '@/components/product/product-card'
import { ProductImage } from '@/components/common/product-image'
import { RatingStars } from '@/components/common/rating-stars'
import { toProductSummaries } from '@/utils/product'
import { formatPrice } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { PageResponse } from '@/types/api'
import type { ProductResponse, ProductSummaryResponse } from '@/types'

export type ProductSectionVariant = 'grid' | 'rail' | 'editorial' | 'ranked'

interface ProductSectionProps {
  eyebrow?: string
  title: string
  subtitle?: string
  viewAllTo?: string
  /** Presentation variant; grid is the default 4-column layout. */
  variant?: ProductSectionVariant
  className?: string
  query: {
    data?: PageResponse<ProductResponse>
    isPending: boolean
    isError: boolean
    refetch?: () => void
  }
}

/**
 * A homepage product section. All data comes from the existing
 * `useProducts` query — this component only changes the presentation.
 */
export function ProductSection({
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  variant = 'grid',
  className,
  query,
}: ProductSectionProps) {
  const products = toProductSummaries(query.data?.content ?? [])
  const ratings = (query.data?.content ?? []).map((product) => product.averageRating)
  const isEmpty = !query.isPending && !query.isError && products.length === 0

  return (
    <section aria-label={title} className={cn('space-y-7', className)}>
      <MotionReveal>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} viewAllTo={viewAllTo} />
      </MotionReveal>

      {query.isError ? (
        <MotionReveal>
          <ErrorState onRetry={query.refetch} message="We couldn't load these products." />
        </MotionReveal>
      ) : isEmpty ? (
        <MotionReveal>
          <EmptyState
            icon={PackageOpen}
            title="Nothing here yet"
            description="We're preparing something new for you."
            action={
              <Button asChild variant="outline">
                <Link to="/products">Explore all products</Link>
              </Button>
            }
          />
        </MotionReveal>
      ) : query.isPending ? (
        <SectionSkeleton variant={variant} />
      ) : (
        <VariantContent variant={variant} products={products} ratings={ratings} />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Content variants
// ---------------------------------------------------------------------------

function VariantContent({
  variant,
  products,
  ratings,
}: {
  variant: ProductSectionVariant
  products: ProductSummaryResponse[]
  ratings: number[]
}) {
  switch (variant) {
    case 'rail':
      return <RailContent products={products} ratings={ratings} />
    case 'editorial':
      return <EditorialContent products={products} ratings={ratings} />
    case 'ranked':
      return <RankedContent products={products} ratings={ratings} />
    default:
      return <GridContent products={products} ratings={ratings} />
  }
}

function GridContent({ products, ratings }: { products: ProductSummaryResponse[]; ratings: number[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <MotionReveal key={product.publicId} delay={(i % 4) * 0.06} className="h-full">
          <ProductCard product={product} rating={ratings[i]} className="h-full" />
        </MotionReveal>
      ))}
    </div>
  )
}

function RailContent({ products, ratings }: { products: ProductSummaryResponse[]; ratings: number[] }) {
  return (
    <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
      {products.map((product, i) => (
        <MotionReveal
          key={product.publicId}
          delay={(i % 5) * 0.05}
          className="w-[220px] shrink-0 snap-start sm:w-[250px] lg:w-[270px]"
        >
          <ProductCard product={product} rating={ratings[i]} className="h-full" />
        </MotionReveal>
      ))}
    </div>
  )
}

function EditorialContent({ products, ratings }: { products: ProductSummaryResponse[]; ratings: number[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((product, i) => (
        <MotionReveal
          key={product.publicId}
          delay={(i % 4) * 0.06}
          className={cn(i === 0 && 'col-span-2 lg:col-span-2 lg:row-span-2', 'h-full')}
        >
          <ProductCard product={product} rating={ratings[i]} className="h-full" />
        </MotionReveal>
      ))}
    </div>
  )
}

function RankedContent({ products, ratings }: { products: ProductSummaryResponse[]; ratings: number[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product, i) => (
        <MotionReveal key={product.publicId} delay={(i % 2) * 0.06}>
          <RankedRow rank={i + 1} product={product} rating={ratings[i]} />
        </MotionReveal>
      ))}
    </div>
  )
}

function RankedRow({
  rank,
  product,
  rating,
}: {
  rank: number
  product: ProductSummaryResponse
  rating?: number
}) {
  const outOfStock = product.stockQuantity <= 0

  return (
    <Link
      to={`/products/${product.publicId}`}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-3 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span
        className="w-8 shrink-0 text-center font-display text-xl font-extrabold tabular-nums text-muted-foreground/40 transition-colors group-hover:text-primary"
        aria-hidden
      >
        {String(rank).padStart(2, '0')}
      </span>
      <ProductImage src={product.imageUrl} alt={product.name} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
          {product.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {rating !== undefined && rating > 0 && <RatingStars value={rating} />}
          <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</p>
          {outOfStock && <span className="text-xs text-destructive">Out of stock</span>}
        </div>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Skeletons (shape-matched to each variant)
// ---------------------------------------------------------------------------

function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2 rounded-lg border p-3', className)}>
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

function SectionSkeleton({ variant }: { variant: ProductSectionVariant }) {
  if (variant === 'rail') {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} className="w-[220px] shrink-0 sm:w-[250px] lg:w-[270px]" />
        ))}
      </div>
    )
  }
  if (variant === 'editorial') {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <ProductCardSkeleton className="col-span-2 row-span-2 h-full" />
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (variant === 'ranked') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border p-3">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
