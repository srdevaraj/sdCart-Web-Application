import { Skeleton } from '@/components/ui/skeleton'

export function ProductsLoadingSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}
