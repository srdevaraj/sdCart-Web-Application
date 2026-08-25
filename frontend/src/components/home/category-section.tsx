import { Link } from 'react-router-dom'
import { ArrowRight, Boxes } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { SectionHeading } from '@/components/common/section-heading'
import { MotionReveal } from '@/components/common/motion'
import { ProductImage } from '@/components/common/product-image'
import type { CategoryResponse } from '@/types'

interface CategorySectionProps {
  query: {
    data?: CategoryResponse[]
    isPending: boolean
    isError: boolean
    refetch?: () => void
  }
}

export function CategorySection({ query }: CategorySectionProps) {
  return (
    <section className="container py-14 lg:py-20" aria-labelledby="home-categories">
      <MotionReveal>
        <SectionHeading
          eyebrow="Curated collections"
          title="Shop by category"
          subtitle="Find your next favourite across our hand-picked departments."
          viewAllTo="/categories"
        />
      </MotionReveal>

      {query.isError ? (
        <MotionReveal>
          <ErrorState onRetry={query.refetch} message="We couldn't load categories." />
        </MotionReveal>
      ) : query.isPending ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton-shimmer h-40 rounded-2xl sm:h-48" />
          ))}
        </div>
      ) : query.data && query.data.length === 0 ? (
        <MotionReveal>
          <EmptyState
            icon={Boxes}
            title="No categories yet"
            description="Categories will appear here once the store is stocked."
          />
        </MotionReveal>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(query.data ?? []).map((category, i) => (
            <MotionReveal key={category.publicId} delay={(i % 4) * 0.06} className="h-full">
              <CategoryCard category={category} />
            </MotionReveal>
          ))}
        </div>
      )}
    </section>
  )
}

function CategoryCard({ category }: { category: CategoryResponse }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative block h-40 overflow-hidden rounded-2xl border bg-muted card-glow sm:h-48"
    >
      <ProductImage
        src={category.imageUrl}
        alt={category.name}
        className="absolute inset-0 h-full w-full bg-muted"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Improved overlay — glassmorphic bottom panel */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" aria-hidden />

      <div className="relative z-10 flex h-full flex-col justify-end p-4">
        <div className="flex items-end justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-white drop-shadow-sm sm:text-lg">
            {category.name}
          </h3>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 translate-x-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:bg-white/25 group-hover:opacity-100"
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

