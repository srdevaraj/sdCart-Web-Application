import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Boxes } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { SectionHeading } from '@/components/common/section-heading'
import { MotionReveal } from '@/components/common/motion'
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
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(category.imageUrl) && !imageFailed

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative block h-40 overflow-hidden rounded-2xl border bg-muted card-glow sm:h-48"
    >
      {showImage ? (
        <img
          src={category.imageUrl as string}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/50 to-muted transition-transform duration-700 ease-out group-hover:scale-110"
        />
      )}

      {/* Improved overlay — glassmorphic bottom panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-white drop-shadow-sm sm:text-lg">
          {category.name}
        </h3>
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 translate-x-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-white/25"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
