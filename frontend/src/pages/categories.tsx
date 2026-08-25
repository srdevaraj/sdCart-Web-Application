import { Link } from 'react-router-dom'
import { ArrowRight, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ProductImage } from '@/components/common/product-image'
import { useCategories } from '@/features/products/hooks'

export default function CategoriesPage() {
  const categories = useCategories(true)

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Shop by category</h1>
        <p className="mt-2 text-muted-foreground">Explore our collections and find exactly what you need.</p>
      </header>

      {categories.isError ? (
        <ErrorState onRetry={() => categories.refetch()} message="We couldn't load categories." />
      ) : categories.isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : categories.data.length === 0 ? (
        <EmptyState icon={Boxes} title="No categories yet" description="Categories will appear here once the store is stocked." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.data.map((category) => (
            <Link
              key={category.publicId}
              to={`/products?category=${category.slug}`}
              className="group relative flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl border bg-muted p-6 transition-shadow hover:shadow-pop card-glow"
            >
              <ProductImage
                src={category.imageUrl}
                alt={category.name}
                className="absolute inset-0 h-full w-full bg-muted"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" aria-hidden />
              <div className="relative z-10">
                <h2 className="font-display text-xl font-bold text-white drop-shadow-sm">{category.name}</h2>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{category.description}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white">
                  Shop {category.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-lg bg-muted/50 p-8 text-center">
        <h2 className="font-display text-xl font-bold">Can't find what you're looking for?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Browse the full catalog instead.</p>
        <Button asChild className="mt-4">
          <Link to="/products">Browse all products</Link>
        </Button>
      </div>
    </div>
  )
}
