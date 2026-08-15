import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProductImage } from '@/components/common/product-image'
import { cartErrorMessage, useAddToCart } from '@/features/cart/hooks'
import { useRemoveFromWishlist, useWishlist } from '@/features/wishlist/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import type { WishlistItemResponse } from '@/types'

export default function WishlistPage() {
  const wishlistQuery = useWishlist()
  const addToCart = useAddToCart()
  const removeFromWishlist = useRemoveFromWishlist()

  if (wishlistQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      </div>
    )
  }

  if (wishlistQuery.isError) {
    return <ErrorState onRetry={() => wishlistQuery.refetch()} message="We couldn't load your wishlist." />
  }

  const items = wishlistQuery.data?.items ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} saved item{items.length === 1 ? '' : 's'}.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime."
          action={
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <WishlistCard
              key={item.publicId}
              item={item}
              moving={addToCart.isPending}
              onMoveToCart={() => {
                addToCart.mutate(
                  { productId: item.product.publicId, quantity: 1 },
                  {
                    onSuccess: () => {
                      removeFromWishlist.mutate(item.product.publicId)
                      toast.success('Moved to cart')
                    },
                    onError: (error) => toast.error(cartErrorMessage(error)),
                  },
                )
              }}
              onRemove={() => {
                removeFromWishlist.mutate(item.product.publicId, {
                  onSuccess: () => toast.success('Removed from wishlist'),
                  onError: (error) => toast.error(getErrorMessage(error)),
                })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface WishlistCardProps {
  item: WishlistItemResponse
  moving?: boolean
  onMoveToCart: () => void
  onRemove: () => void
}

function WishlistCard({ item, moving, onMoveToCart, onRemove }: WishlistCardProps) {
  const outOfStock = item.product.stockQuantity <= 0

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <Link to={`/products/${item.product.publicId}`} className="shrink-0" aria-label={item.product.name}>
        <ProductImage src={item.product.imageUrl} alt={item.product.name} className="h-24 w-24 rounded-md" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link to={`/products/${item.product.publicId}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
          {item.product.name}
        </Link>
        <p className="mt-1 font-semibold tabular-nums">{formatPrice(item.product.price)}</p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Button size="sm" onClick={onMoveToCart} disabled={outOfStock || moving}>
            <ShoppingCart className="h-4 w-4" aria-hidden /> Move to cart
          </Button>
          <ConfirmDialog
            title="Remove from wishlist?"
            description={`${item.product.name} will be removed from your wishlist.`}
            confirmLabel="Remove"
            destructive
            onConfirm={onRemove}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.product.name}`}>
                <Trash2 />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
