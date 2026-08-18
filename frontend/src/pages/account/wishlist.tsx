import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  HeartOff,
  ShoppingCart,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProductImage } from '@/components/common/product-image'
import { Reveal } from '@/components/common/reveal'
import {
  cartErrorMessage,
  useAddToCart,
} from '@/features/cart/hooks'
import {
  useRemoveFromWishlist,
  useWishlist,
} from '@/features/wishlist/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import type { WishlistItemResponse } from '@/types'

export default function WishlistPage() {
  const wishlistQuery = useWishlist()
  const addToCart = useAddToCart()
  const removeFromWishlist = useRemoveFromWishlist()

  if (wishlistQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-[220px] rounded-[30px]" />

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[270px] rounded-[26px]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (wishlistQuery.isError) {
    return (
      <ErrorState
        onRetry={() => wishlistQuery.refetch()}
        message="We couldn't load your wishlist."
      />
    )
  }

  const items = wishlistQuery.data?.items ?? []

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
            {/* Main hero content */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Heart icon */}
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-primary/[0.08] text-primary shadow-sm transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
                    <Heart className="h-9 w-9 fill-primary/10 sm:h-10 sm:w-10" />

                    {items.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-md">
                        {items.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Heading */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Saved for later
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Your wishlist
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mx-0 sm:text-base">
                    Keep the products you love close. Move your favorites
                    to your cart whenever you're ready.
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
                      Wishlist
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {items.length}{' '}
                      {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Heart className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Your favorites
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {items.length === 0
                            ? 'Nothing saved yet'
                            : 'Ready whenever you are'}
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
                    Continue shopping
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
      {items.length === 0 ? (
        <Reveal delay={100}>
          <div className="rounded-[28px] border bg-card p-8 shadow-sm sm:p-12">
            <EmptyState
              icon={HeartOff}
              title="Your wishlist is waiting"
              description="Save products you love and come back to them anytime."
              action={
                <Button
                  asChild
                  className="group h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Link to="/products">
                    Browse products
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
                  Your collection
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Saved products
                </h2>
              </div>

              <p className="text-xs text-muted-foreground">
                {items.length} saved{' '}
                {items.length === 1 ? 'product' : 'products'}
              </p>
            </div>
          </Reveal>

          {/* ================================================================
              PRODUCT GRID
          ================================================================= */}
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item, index) => (
              <Reveal
                key={item.publicId}
                delay={130 + index * 55}
              >
                <WishlistCard
                  item={item}
                  moving={addToCart.isPending}
                  onMoveToCart={() => {
                    addToCart.mutate(
                      {
                        productId: item.product.publicId,
                        quantity: 1,
                      },
                      {
                        onSuccess: () => {
                          removeFromWishlist.mutate(
                            item.product.publicId,
                          )

                          toast.success('Moved to cart')
                        },

                        onError: (error) =>
                          toast.error(
                            cartErrorMessage(error),
                          ),
                      },
                    )
                  }}
                  onRemove={() => {
                    removeFromWishlist.mutate(
                      item.product.publicId,
                      {
                        onSuccess: () =>
                          toast.success(
                            'Removed from wishlist',
                          ),

                        onError: (error) =>
                          toast.error(
                            getErrorMessage(error),
                          ),
                      },
                    )
                  }}
                />
              </Reveal>
            ))}
          </div>
        </>
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

function WishlistCard({
  item,
  moving,
  onMoveToCart,
  onRemove,
}: WishlistCardProps) {
  const outOfStock = item.product.stockQuantity <= 0

  return (
    <article className="group relative flex h-full overflow-hidden rounded-[26px] border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* ================================================================
          CARD GLOW
      ================================================================= */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/[0.045] blur-3xl transition-transform duration-700 group-hover:scale-125" />

      {/* ================================================================
          PRODUCT IMAGE
      ================================================================= */}
      <Link
        to={`/products/${item.product.publicId}`}
        className="relative m-4 block w-[130px] shrink-0 overflow-hidden rounded-2xl border bg-muted/20 sm:m-5 sm:w-[150px]"
        aria-label={item.product.name}
      >
        <div className="relative aspect-square h-full w-full">
          <ProductImage
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Stock badge */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/65 backdrop-blur-[2px]">
              <span className="rounded-full border bg-background/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
                Out of stock
              </span>
            </div>
          )}

          {/* Wishlist indicator */}
          <div className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-background/80 text-primary shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
            <Heart className="h-3.5 w-3.5 fill-current" />
          </div>
        </div>
      </Link>

      {/* ================================================================
          PRODUCT CONTENT
      ================================================================= */}
      <div className="relative flex min-w-0 flex-1 flex-col py-5 pr-4 sm:pr-5">
        {/* Product info */}
        <div className="min-w-0">
          <Link
            to={`/products/${item.product.publicId}`}
            className="line-clamp-2 text-sm font-semibold leading-5 tracking-tight transition-colors duration-200 hover:text-primary sm:text-base"
          >
            {item.product.name}
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <p className="font-display text-lg font-bold tabular-nums tracking-tight">
              {formatPrice(item.product.price)}
            </p>
          </div>

          {/* Stock state */}
          <div className="mt-2">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Currently unavailable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In stock
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button
            size="sm"
            onClick={onMoveToCart}
            disabled={outOfStock || moving}
            className="group/cart h-10 flex-1 rounded-xl px-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/cart:scale-110" />

            <span className="truncate">
              {moving ? 'Adding...' : 'Move to cart'}
            </span>
          </Button>

          <ConfirmDialog
            title="Remove from wishlist?"
            description={`${item.product.name} will be removed from your wishlist.`}
            confirmLabel="Remove"
            destructive
            onConfirm={onRemove}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${item.product.name}`}
                className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 transition-transform duration-300 hover:scale-105" />
              </Button>
            }
          />
        </div>
      </div>
    </article>
  )
}