import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/common/product-image'
import { RatingStars } from '@/components/common/rating-stars'
import { useAuthStore } from '@/features/auth/auth-store'
import { useAddToCart } from '@/features/cart/hooks'
import { useAddToWishlist, useRemoveFromWishlist, useWishlistProductIds } from '@/features/wishlist/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import type { ProductSummaryResponse } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductSummaryResponse
  /** Optional aggregate rating (not included in summary responses). */
  rating?: number
  className?: string
}

export function ProductCard({ product, rating, className }: ProductCardProps) {
  const navigate = useNavigate()
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const wishlistIds = useWishlistProductIds()
  const isWishlisted = wishlistIds.has(product.publicId)

  const addToCart = useAddToCart()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  const outOfStock = product.stockQuantity <= 0

  function handleAddToCart() {
    if (!isAuthed) {
      navigate('/login', { state: { from: `/products/${product.publicId}` } })
      return
    }
    addToCart.mutate(
      { productId: product.publicId, quantity: 1 },
      {
        onSuccess: () => toast.success('Added to cart'),
        onError: (error) => toast.error(getErrorMessage(error, 'Could not add to cart')),
      },
    )
  }

  function handleToggleWishlist() {
    if (!isAuthed) {
      navigate('/login', { state: { from: `/products/${product.publicId}` } })
      return
    }
    if (isWishlisted) {
      removeFromWishlist.mutate(product.publicId, {
        onSuccess: () => toast.success('Removed from wishlist'),
        onError: (error) => toast.error(getErrorMessage(error)),
      })
    } else {
      addToWishlist.mutate(product.publicId, {
        onSuccess: () => toast.success('Added to wishlist'),
        onError: (error) => toast.error(getErrorMessage(error)),
      })
    }
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
    >
      <Link
        to={`/products/${product.publicId}`}
        className="relative block aspect-square overflow-hidden bg-muted"
        aria-label={product.name}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-muted-foreground/90 px-2 py-0.5 text-xs font-semibold text-background">
            Out of stock
          </span>
        )}
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={isWishlisted}
        className="absolute right-2 top-2 rounded-full bg-background/90 shadow-sm backdrop-blur"
      >
        <Heart className={cn('h-4 w-4', isWishlisted && 'fill-destructive text-destructive')} />
      </Button>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          <Link to={`/products/${product.publicId}`} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {rating !== undefined && <RatingStars value={rating} className="pt-0.5" />}
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            onClick={handleAddToCart}
            disabled={outOfStock || addToCart.isPending}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}
