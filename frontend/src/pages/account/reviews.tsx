import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  MessageSquarePlus,
  MessageCircle,
  Sparkles,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ProductImage } from '@/components/common/product-image'
import { ReviewForm } from '@/components/product/review-form'
import { Reveal } from '@/components/common/reveal'
import { useOrders } from '@/features/orders/hooks'

/**
 * The backend has no "my reviews" endpoint, so this page surfaces the
 * products from your orders that you can review (one review per product).
 */
export default function MyReviewsPage() {
  const ordersQuery = useOrders(0, 50)

  const [reviewProduct, setReviewProduct] = useState<{
    id: string
    name: string
    image: string | null
  } | null>(null)

  const purchasable = useMemo(() => {
    const seen = new Set<string>()

    const result: Array<{
      productId: string
      name: string
      image: string | null
    }> = []

    for (const order of ordersQuery.data?.content ?? []) {
      for (const item of order.items) {
        if (item.productId && !seen.has(item.productId)) {
          seen.add(item.productId)

          result.push({
            productId: item.productId,
            name: item.productName,
            image: item.productImage,
          })
        }
      }
    }

    return result
  }, [ordersQuery.data])

  if (ordersQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-[220px] rounded-[30px]" />

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[210px] rounded-[26px]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (ordersQuery.isError) {
    return (
      <ErrorState
        onRetry={() => ordersQuery.refetch()}
        message="We couldn't load your reviews."
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================================
          HERO
      ================================================================= */}
      <Reveal>
        <section className="group relative overflow-hidden rounded-[30px] border bg-card shadow-sm transition-all duration-500 hover:shadow-xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-primary/[0.10] blur-3xl transition-transform duration-1000 group-hover:scale-125" />

            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-primary/[0.045] blur-3xl" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent" />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_auto]">
            {/* Main hero */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Icon */}
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-primary/[0.08] text-primary shadow-sm transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
                    <Star className="h-9 w-9 fill-primary/10 sm:h-10 sm:w-10" />

                    {purchasable.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-md">
                        {purchasable.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Heading */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Your experience matters
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Share your experience
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mx-0 sm:text-base">
                    Review products you've purchased and help other shoppers
                    make better decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero side panel */}
            <div className="border-t bg-background/50 p-6 backdrop-blur-sm lg:w-[290px] lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Review center
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {purchasable.length}{' '}
                      {purchasable.length === 1
                        ? 'product'
                        : 'products'}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MessageCircle className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Your feedback
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          One review per product
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="group/shop mt-6 h-11 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.035] hover:text-primary"
                >
                  <Link to="/products">
                    Explore products
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/shop:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================================================================
          EMPTY STATE
      ================================================================= */}
      {purchasable.length === 0 ? (
        <Reveal delay={100}>
          <div className="rounded-[28px] border bg-card p-8 shadow-sm sm:p-12">
            <EmptyState
              icon={Star}
              title="Nothing to review yet"
              description="Products from your orders will appear here so you can share your experience."
              action={
                <Button
                  asChild
                  className="group h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Link to="/products">
                    Start shopping
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              }
            />
          </div>
        </Reveal>
      ) : (
        <>
          {/* ================================================================
              SECTION HEADER
          ================================================================= */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Purchased products
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Products waiting for your feedback
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Verified purchases
              </div>
            </div>
          </Reveal>

          {/* ================================================================
              PRODUCT GRID
          ================================================================= */}
          <div className="grid gap-5 sm:grid-cols-2">
            {purchasable.map((product, index) => (
              <Reveal
                key={product.productId}
                delay={130 + index * 55}
              >
                <ReviewProductCard
                  product={product}
                  onReview={() =>
                    setReviewProduct({
                      id: product.productId,
                      name: product.name,
                      image: product.image,
                    })
                  }
                />
              </Reveal>
            ))}
          </div>
        </>
      )}

      {/* ================================================================
          REVIEW DIALOG
      ================================================================= */}
      <Dialog
        open={reviewProduct !== null}
        onOpenChange={(open) =>
          !open && setReviewProduct(null)
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[26px] sm:max-w-xl">
          <DialogHeader className="border-b pb-5">
            <div className="mb-4 flex items-center gap-4">
              {reviewProduct?.image ? (
                <ProductImage
                  src={reviewProduct.image}
                  alt={reviewProduct.name}
                  className="h-14 w-14 rounded-xl border"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Your review
                </p>

                <DialogTitle className="mt-1 line-clamp-2 text-lg">
                  {reviewProduct?.name}
                </DialogTitle>
              </div>
            </div>

            <DialogDescription className="leading-5">
              Share your experience with this product and help other
              shoppers make a confident decision.
            </DialogDescription>
          </DialogHeader>

          {reviewProduct && (
            <div className="pt-2">
              <ReviewForm
                productId={reviewProduct.id}
                onSuccess={() => setReviewProduct(null)}
                submitLabel="Post review"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ========================================================================
   REVIEW PRODUCT CARD
======================================================================== */

interface ReviewProductCardProps {
  product: {
    productId: string
    name: string
    image: string | null
  }
  onReview: () => void
}

function ReviewProductCard({
  product,
  onReview,
}: ReviewProductCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[26px] border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/[0.045] blur-3xl transition-transform duration-700 group-hover:scale-125" />

      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Product image */}
        <Link
          to={`/products/${product.productId}`}
          className="group/image relative mx-auto block shrink-0 overflow-hidden rounded-2xl border bg-muted/20 sm:mx-0"
          aria-label={product.name}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-28 w-28 object-cover transition-transform duration-700 group-hover/image:scale-105 sm:h-32 sm:w-32"
          />

          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/image:opacity-100" />

          {/* Review indicator */}
          <div className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-background/85 text-primary shadow-sm backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
        </Link>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Purchased
            </span>

            <Link
              to={`/products/${product.productId}`}
              className="mt-1.5 line-clamp-2 block text-sm font-semibold leading-5 tracking-tight transition-colors duration-200 hover:text-primary sm:text-base"
            >
              {product.name}
            </Link>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onReview}
              className="group/review h-10 w-full rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.035] hover:text-primary sm:w-auto"
            >
              <MessageSquarePlus className="mr-2 h-3.5 w-3.5 transition-transform duration-300 group-hover/review:scale-110" />

              Write a review

              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover/review:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px w-0 bg-primary/30 transition-all duration-700 group-hover:w-full" />
    </article>
  )
}