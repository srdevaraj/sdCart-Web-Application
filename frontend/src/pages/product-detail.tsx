import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { ProductImage } from '@/components/common/product-image'
import { ProductGrid } from '@/components/product/product-grid'
import { toProductSummaries } from '@/utils/product'
import { RatingStars } from '@/components/common/rating-stars'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ReviewForm } from '@/components/product/review-form'
import { ReviewItem } from '@/components/product/review-item'
import { useAuthStore } from '@/features/auth/auth-store'
import { cartErrorMessage, useAddToCart } from '@/features/cart/hooks'
import { useAddToWishlist, useRemoveFromWishlist, useWishlistProductIds } from '@/features/wishlist/hooks'
import { useProduct, useProducts } from '@/features/products/hooks'
import { useProductReviews } from '@/features/reviews/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/utils/format'

export default function ProductDetailPage() {
  const { publicId } = useParams<{ publicId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [reviewPage, setReviewPage] = useState(0)

  const productQuery = useProduct(publicId)
  const product = productQuery.data
  const reviewsPage = useProductReviews(publicId, reviewPage)
  const related = useProducts(
    product?.category?.slug
      ? { category: product.category.slug, size: 4, sort: 'averageRating,desc' }
      : { sort: 'averageRating,desc', size: 4 },
  )

  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const wishlistIds = useWishlistProductIds()
  const isWishlisted = publicId ? wishlistIds.has(publicId) : false

  const addToCart = useAddToCart()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  useEffect(() => {
    setQuantity(1)
    setActiveImage(0)
  }, [publicId])

  if (productQuery.isPending) {
    return <ProductDetailSkeleton />
  }

  if (productQuery.isError || !product) {
    return (
      <div className="container py-12">
        <ErrorState
          title="Product not found"
          message="This product may have been removed or is no longer available."
          onRetry={() => productQuery.refetch()}
        />
      </div>
    )
  }

  // Stable reference for closures: TS narrowing is not preserved inside them.
  const productId = product.publicId

  const images = product.images.length > 0 ? product.images : null
  const outOfStock = product.stockQuantity <= 0
  const hasDiscount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : 0

  function requireAuth(): boolean {
    if (!isAuthed) {
      navigate('/login', { state: { from: location.pathname } })
      return false
    }
    return true
  }

  function handleAddToCart() {
    if (!requireAuth()) return
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => toast.success('Added to cart'),
        onError: (error) => toast.error(cartErrorMessage(error)),
      },
    )
  }

  function handleBuyNow() {
    if (!requireAuth()) return
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => navigate('/checkout'),
        onError: (error) => toast.error(cartErrorMessage(error)),
      },
    )
  }

  function handleToggleWishlist() {
    if (!requireAuth()) return
    if (isWishlisted) {
      removeFromWishlist.mutate(productId, {
        onSuccess: () => toast.success('Removed from wishlist'),
        onError: (error) => toast.error(getErrorMessage(error)),
      })
    } else {
      addToWishlist.mutate(productId, {
        onSuccess: () => toast.success('Added to wishlist'),
        onError: (error) => toast.error(getErrorMessage(error)),
      })
    }
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <li aria-hidden>/</li>
          {product.category && (
            <>
              <li>
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary">
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
            </>
          )}
          <li className="font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <ProductImage
              src={images ? images[activeImage]?.imageUrl : product.images[0]?.imageUrl}
              alt={images ? images[activeImage]?.altText ?? product.name : product.name}
              className="aspect-square w-full"
            />
          </div>
          {images && images.length > 1 && (
            <div className="mt-3 flex gap-2" role="tablist" aria-label="Product images">
              {images.map((image, i) => (
                <button
                  key={image.publicId}
                  type="button"
                  role="tab"
                  aria-selected={i === activeImage}
                  aria-label={image.altText ?? `Image ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-md border transition-colors',
                    i === activeImage ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50',
                  )}
                >
                  <ProductImage src={image.imageUrl} alt={image.altText ?? ''} className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            {product.brand && (
              <Link
                to={`/products?brand=${product.brand.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars value={product.averageRating} count={product.reviewCount} size="md" />
              <span className="text-sm text-muted-foreground">· {product.reviewCount} reviews</span>
            </div>
          </div>

          <div className="flex items-end gap-3 rounded-lg bg-muted/50 p-4">
            <p className="font-display text-3xl font-bold tabular-nums">{formatPrice(product.price)}</p>
            {hasDiscount && (
              <>
                <p className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
                <Badge variant="success">{discountPercent}% off</Badge>
              </>
            )}
          </div>

          {outOfStock ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : (
            <p className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" aria-hidden /> In stock — {product.stockQuantity} available
            </p>
          )}

          {product.shortDescription && <p className="text-muted-foreground">{product.shortDescription}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center rounded-md border border-input">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock || quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-12 text-center text-sm font-medium tabular-nums" aria-label={`Quantity ${quantity}`}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={outOfStock || quantity >= product.stockQuantity}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={outOfStock || addToCart.isPending} className="flex-1 sm:flex-none">
              <ShoppingCart aria-hidden /> Add to cart
            </Button>
            <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={outOfStock} className="flex-1 sm:flex-none">
              Buy now
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className="h-11 w-11"
            >
              <Heart className={cn('h-5 w-5', isWishlisted && 'fill-destructive text-destructive')} aria-hidden />
            </Button>
          </div>

          <div className="grid gap-3 pt-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" aria-hidden /> Free shipping over ₹50</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> 30-day returns</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="max-w-3xl">
          <p className="whitespace-pre-line text-muted-foreground">{product.description ?? product.shortDescription ?? 'No description available.'}</p>
        </TabsContent>
        <TabsContent value="specifications">
          {product.specifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No specifications listed.</p>
          ) : (
            <dl className="max-w-xl divide-y rounded-lg border">
              {product.specifications.map((spec, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                  <dt className="font-medium">{spec.name}</dt>
                  <dd className="text-muted-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </TabsContent>
        <TabsContent value="reviews">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Review form / summary */}
            <div className="space-y-4">
              <div className="rounded-lg border p-5">
                <p className="text-sm font-semibold">Average rating</p>
                <p className="mt-1 font-display text-4xl font-bold">{product.averageRating.toFixed(1)}</p>
                <RatingStars value={product.averageRating} count={product.reviewCount} size="md" className="mt-2" />
              </div>
              {isAuthed ? (
                <div className="rounded-lg border p-5">
                  <h3 className="mb-3 text-sm font-semibold">Write a review</h3>
                  <ReviewForm productId={product.publicId} />
                </div>
              ) : (
                <div className="rounded-lg border p-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Link to="/login" state={{ from: `/products/${product.publicId}` }} className="font-medium text-primary hover:underline">
                      Sign in
                    </Link>{' '}
                    to write a review.
                  </p>
                </div>
              )}
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {reviewsPage.isError ? (
                <ErrorState onRetry={() => reviewsPage.refetch()} message="We couldn't load reviews." />
              ) : reviewsPage.isPending ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
              ) : reviewsPage.data.empty ? (
                <EmptyState title="No reviews yet" description="Be the first to review this product." />
              ) : (
                <>
                  <div className="space-y-3">
                    {reviewsPage.data.content.map((review) => (
                      <ReviewItem key={review.publicId} review={review} />
                    ))}
                  </div>
                  <Pagination
                    page={reviewsPage.data.page}
                    totalPages={reviewsPage.data.totalPages}
                    onPageChange={(next) => {
                      setReviewPage(next)
                      document.getElementById('reviews-tab')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related products */}
      <section className="mt-16 space-y-5" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-2xl font-bold tracking-tight">
          You may also like
        </h2>
        {related.isError ? (
          <ErrorState onRetry={() => related.refetch()} message="We couldn't load related products." />
        ) : (
          <ProductGrid
            products={toProductSummaries(related.data?.content ?? [])}
            loading={related.isPending}
            skeletonCount={4}
          />
        )}
      </section>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-56" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  )
}
