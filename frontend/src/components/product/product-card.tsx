import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
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

  const prefersReduced = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  // Parallax tilt on hover
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { stiffness: 300, damping: 30 })

  function handleMouseMove(e: React.MouseEvent) {
    if (prefersReduced) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

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
    <motion.article
      ref={prefersReduced ? undefined : cardRef}
      style={prefersReduced ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={prefersReduced ? undefined : handleMouseMove}
      onMouseLeave={prefersReduced ? undefined : handleMouseLeave}
      whileHover={prefersReduced ? undefined : { y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card card-glow will-change-transform',
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
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Hover overlay glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(var(--accent-glow)/0.05)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
        className="absolute right-2 top-2 rounded-full glass-surface shadow-sm transition-transform duration-200 hover:scale-110"
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
          <p className="font-mono font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            onClick={handleAddToCart}
            disabled={outOfStock || addToCart.isPending}
            aria-label={`Add ${product.name} to cart`}
            className="transition-transform duration-200 hover:scale-105"
          >
            <ShoppingCart aria-hidden />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
