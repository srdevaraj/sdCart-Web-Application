import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  Package,
  ShoppingBag,
  ShoppingCart as CartIcon,
  Tag,
  Trash2,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { QuantityInput } from '@/components/common/quantity-input'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProductImage } from '@/components/common/product-image'
import { Reveal } from '@/components/common/reveal'
import {
  cartErrorMessage,
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/hooks'
import { useValidateCoupon } from '@/features/coupons/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import type { CartItemResponse } from '@/types'

const FREE_SHIPPING_THRESHOLD = 50
const FLAT_SHIPPING = 5.99

export default function CartPage() {
  const navigate = useNavigate()

  const cartQuery = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const clearCart = useClearCart()
  const validateCoupon = useValidateCoupon()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
  } | null>(null)

  const cart = cartQuery.data

  const subtotal = Number(cart?.totalAmount ?? 0)
  const discount = appliedCoupon?.discount ?? 0
  const afterDiscount = Math.max(0, subtotal - discount)

  const shipping =
    cart && cart.totalQuantity > 0
      ? afterDiscount >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING
      : 0

  const total = afterDiscount + shipping

  const shippingProgress = Math.min(
    100,
    (afterDiscount / FREE_SHIPPING_THRESHOLD) * 100,
  )

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - afterDiscount,
  )

  function applyCoupon(e: FormEvent) {
    e.preventDefault()

    const code = couponCode.trim()

    if (!code) return

    validateCoupon.mutate(
      {
        code,
        orderAmount: subtotal,
      },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setAppliedCoupon({
              code: result.code,
              discount: Number(result.discountAmount),
            })

            setCouponCode('')

            toast.success(`Coupon ${result.code} applied`)
          } else {
            setAppliedCoupon(null)

            toast.error(
              result.message || 'This coupon is not valid for your cart',
            )
          }
        },

        onError: (error) => {
          setAppliedCoupon(null)

          toast.error(
            getErrorMessage(error, 'Could not validate coupon'),
          )
        },
      },
    )
  }

  if (cartQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <Skeleton className="h-20 rounded-2xl" />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-36 rounded-3xl"
              />
            ))}
          </div>

          <Skeleton className="h-[520px] rounded-3xl" />
        </div>
      </div>
    )
  }

  if (cartQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          onRetry={() => cartQuery.refetch()}
          message="We couldn't load your cart."
        />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border bg-primary/5 text-primary shadow-sm">
              <CartIcon className="h-10 w-10" />
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight">
              Your cart is waiting
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Your shopping cart is currently empty. Discover something you
              love and add it to your collection.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-7 rounded-xl px-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Link to="/products">
                Explore products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    )
  }

  const checkoutDisabled = cart.items.some(
    (item) => item.product.stockQuantity < item.quantity,
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 pb-12 sm:px-6 lg:px-8">
      {/* ================================================================
          HEADER
      ================================================================= */}
      <Reveal>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShoppingBag className="h-3.5 w-3.5" />
              Your shopping bag
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Shopping cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Review your items and complete your purchase when you're ready.
            </p>
          </div>

          <ConfirmDialog
            title="Clear your cart?"
            description="All items will be removed from your cart."
            confirmLabel="Clear cart"
            destructive
            onConfirm={async () => {
              await clearCart.mutateAsync(undefined, {
                onError: (error) =>
                  toast.error(cartErrorMessage(error)),
              })

              setAppliedCoupon(null)

              toast.success('Cart cleared')
            }}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="group w-fit text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Clear cart
              </Button>
            }
          />
        </header>
      </Reveal>

      {/* ================================================================
          FREE SHIPPING BANNER
      ================================================================= */}
      <Reveal delay={70}>
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] via-transparent to-transparent" />

          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              {shipping === 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                    <p className="text-sm font-semibold">
                      You've unlocked free shipping
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your order qualifies for complimentary shipping.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">
                    You're close to free shipping
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add{' '}
                    <span className="font-semibold text-foreground">
                      {formatPrice(remainingForFreeShipping)}
                    </span>{' '}
                    more to unlock free shipping.
                  </p>
                </>
              )}

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                Free shipping
              </p>

              <p className="mt-0.5 text-sm font-semibold">
                Over {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================================================================
            CART ITEMS
        ================================================================= */}
        <div className="space-y-4">
          <Reveal delay={120}>
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Your items
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cart.totalQuantity} item
                  {cart.totalQuantity === 1 ? '' : 's'} in your cart
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                <Package className="h-3.5 w-3.5" />
                Ready for checkout
              </div>
            </div>
          </Reveal>

          <div className="space-y-3">
            {cart.items.map((item, index) => (
              <Reveal
                key={item.publicId}
                delay={150 + index * 45}
              >
                <CartRow
                  item={item}
                  onQuantityChange={(quantity) => {
                    updateItem.mutate(
                      {
                        itemPublicId: item.publicId,
                        quantity,
                      },
                      {
                        onError: (error) =>
                          toast.error(cartErrorMessage(error)),
                      },
                    )
                  }}
                  onRemove={() => {
                    removeItem.mutate(item.publicId, {
                      onError: (error) =>
                        toast.error(cartErrorMessage(error)),
                    })
                  }}
                />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ================================================================
            ORDER SUMMARY
        ================================================================= */}
        <Reveal delay={180}>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-3xl border shadow-md">
              <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent p-6">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />

                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Checkout
                    </span>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight">
                    Order summary
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your final order details
                  </p>
                </div>
              </div>

              <CardContent className="space-y-5 p-6">
                {/* Coupon */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />

                    <p className="text-sm font-semibold">
                      Have a promo code?
                    </p>
                  </div>

                  <form
                    onSubmit={applyCoupon}
                    className="flex gap-2"
                  >
                    <Input
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value)
                      }
                      placeholder="Enter coupon"
                      aria-label="Coupon code"
                      className="h-10 rounded-xl"
                    />

                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={validateCoupon.isPending}
                      className="h-10 rounded-xl px-4"
                    >
                      {validateCoupon.isPending
                        ? 'Checking...'
                        : 'Apply'}
                    </Button>
                  </form>

                  {appliedCoupon ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />

                      <span className="min-w-0 truncate">
                        {appliedCoupon.code}
                      </span>

                      <span className="ml-auto shrink-0">
                        −{formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      Tip: try{' '}
                      <strong className="font-semibold text-foreground">
                        WELCOME10
                      </strong>{' '}
                      for 10% off orders over $50.
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price breakdown */}
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Subtotal
                    </dt>

                    <dd className="font-medium tabular-nums">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Discount
                    </dt>

                    <dd className="font-medium tabular-nums text-emerald-600">
                      −{formatPrice(discount)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Shipping
                    </dt>

                    <dd className="font-medium tabular-nums">
                      {shipping === 0
                        ? 'Free'
                        : formatPrice(shipping)}
                    </dd>
                  </div>
                </dl>

                <Separator />

                {/* Total */}
                <div className="rounded-2xl bg-muted/40 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-bold tracking-tight">
                        {formatPrice(total)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">
                        {cart.totalQuantity} item
                        {cart.totalQuantity === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] leading-5 text-muted-foreground">
                  Taxes and final totals are calculated by our system
                  at checkout.
                </p>

                {/* Checkout */}
                <div>
                  <Button
                    className="group h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    size="lg"
                    onClick={() => navigate('/checkout')}
                    disabled={checkoutDisabled}
                  >
                    <span>Proceed to checkout</span>

                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>

                  {checkoutDisabled && (
                    <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                      <p className="text-xs font-medium text-destructive">
                        Some items exceed available stock.
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Adjust the quantities above to continue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Trust */}
                <div className="flex items-center justify-center gap-5 border-t pt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Secure checkout
                  </div>

                  <div className="h-3 w-px bg-border" />

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Protected
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </Reveal>
      </div>

      {/* ================================================================
          BOTTOM TRUST STRIP
      ================================================================= */}
      <Reveal delay={300}>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrustItem
            icon={ShieldCheck}
            title="Secure shopping"
            description="Your checkout is protected."
          />

          <TrustItem
            icon={Truck}
            title="Reliable delivery"
            description="Track your order after purchase."
          />

          <TrustItem
            icon={CheckCircle2}
            title="Easy checkout"
            description="A simple and seamless experience."
          />
        </div>
      </Reveal>
    </div>
  )
}

/* ======================================================================
   CART ROW
====================================================================== */

interface CartRowProps {
  item: CartItemResponse
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

function CartRow({
  item,
  onQuantityChange,
  onRemove,
}: CartRowProps) {
  const outOfStock = item.product.stockQuantity <= 0
  const insufficient =
    item.quantity > item.product.stockQuantity

  return (
    <div
      className={[
        'group relative overflow-hidden rounded-3xl border bg-card',
        'p-4 shadow-sm transition-all duration-500',
        'hover:-translate-y-0.5 hover:shadow-lg',
        outOfStock || insufficient
          ? 'border-destructive/20'
          : '',
      ].join(' ')}
    >
      <div className="flex gap-4 sm:gap-5">
        {/* Product image */}
        <Link
          to={`/products/${item.product.publicId}`}
          className="relative shrink-0 overflow-hidden rounded-2xl border bg-muted/30"
          aria-label={item.product.name}
        >
          <ProductImage
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-24 w-24 transition-transform duration-500 group-hover:scale-105 sm:h-28 sm:w-28"
          />

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
              <span className="rounded-full bg-destructive/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                Out of stock
              </span>
            </div>
          )}
        </Link>

        {/* Product information */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/products/${item.product.publicId}`}
                className="line-clamp-2 text-sm font-semibold leading-5 transition-colors hover:text-primary sm:text-base"
              >
                {item.product.name}
              </Link>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatPrice(item.unitPrice)} each
              </p>

              {(outOfStock || insufficient) && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-destructive/5 px-2 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />

                  <p className="text-[11px] font-medium text-destructive">
                    {outOfStock
                      ? 'Currently out of stock.'
                      : `Only ${item.product.stockQuantity} available.`}
                  </p>
                </div>
              )}
            </div>

            <p className="shrink-0 text-sm font-bold tabular-nums sm:text-base">
              {formatPrice(item.subtotal)}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <QuantityInput
              value={item.quantity}
              min={1}
              max={Math.max(
                1,
                Math.min(99, item.product.stockQuantity),
              )}
              onChange={onQuantityChange}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="group/remove h-9 text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Remove ${item.product.name} from cart`}
            >
              <Trash2 className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover/remove:scale-110" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================
   TRUST ITEM
====================================================================== */

interface TrustItemProps {
  icon: typeof ShieldCheck
  title: string
  description: string
}

function TrustItem({
  icon: Icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}