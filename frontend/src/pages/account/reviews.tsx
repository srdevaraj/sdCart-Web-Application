import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquarePlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ProductImage } from '@/components/common/product-image'
import { ReviewForm } from '@/components/product/review-form'
import { useOrders } from '@/features/orders/hooks'

/**
 * The backend has no "my reviews" endpoint, so this page surfaces the
 * products from your orders that you can review (one review per product).
 */
export default function MyReviewsPage() {
  const ordersQuery = useOrders(0, 50)
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string; image: string | null } | null>(null)

  const purchasable = useMemo(() => {
    const seen = new Set<string>()
    const result: Array<{ productId: string; name: string; image: string | null }> = []
    for (const order of ordersQuery.data?.content ?? []) {
      for (const item of order.items) {
        if (item.productId && !seen.has(item.productId)) {
          seen.add(item.productId)
          result.push({ productId: item.productId, name: item.productName, image: item.productImage })
        }
      }
    }
    return result
  }, [ordersQuery.data])

  if (ordersQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    )
  }

  if (ordersQuery.isError) {
    return <ErrorState onRetry={() => ordersQuery.refetch()} message="We couldn't load your reviews." />
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review products you've purchased. You can post one review per product.
        </p>
      </header>

      {purchasable.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nothing to review yet"
          description="Products from your orders will appear here so you can share your experience."
          action={
            <Button asChild>
              <Link to="/products">Start shopping</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {purchasable.map((product) => (
            <div key={product.productId} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <Link to={`/products/${product.productId}`} className="shrink-0" aria-label={product.name}>
                <ProductImage src={product.image} alt={product.name} className="h-16 w-16 rounded-md" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${product.productId}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
                  {product.name}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setReviewProduct({ id: product.productId, name: product.name, image: product.image })}
                >
                  <MessageSquarePlus className="h-4 w-4" aria-hidden /> Write a review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={reviewProduct !== null} onOpenChange={(open) => !open && setReviewProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {reviewProduct?.name}</DialogTitle>
            <DialogDescription>Share your experience with other shoppers.</DialogDescription>
          </DialogHeader>
          {reviewProduct && (
            <ReviewForm productId={reviewProduct.id} onSuccess={() => setReviewProduct(null)} submitLabel="Post review" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
