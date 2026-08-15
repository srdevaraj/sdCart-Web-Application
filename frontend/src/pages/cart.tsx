import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, ShoppingCart as CartIcon, Tag, Trash2 } from 'lucide-react'
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
import { cartErrorMessage, useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from '@/features/cart/hooks'
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const cart = cartQuery.data
  const subtotal = Number(cart?.totalAmount ?? 0)
  const discount = appliedCoupon?.discount ?? 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const shipping = cart && cart.totalQuantity > 0 ? (afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING) : 0
  const total = afterDiscount + shipping

  function applyCoupon(e: FormEvent) {
    e.preventDefault()
    const code = couponCode.trim()
    if (!code) return
    validateCoupon.mutate(
      { code, orderAmount: subtotal },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setAppliedCoupon({ code: result.code, discount: Number(result.discountAmount) })
            setCouponCode('')
            toast.success(`Coupon ${result.code} applied`)
          } else {
            setAppliedCoupon(null)
            toast.error(result.message || 'This coupon is not valid for your cart')
          }
        },
        onError: (error) => {
          setAppliedCoupon(null)
          toast.error(getErrorMessage(error, 'Could not validate coupon'))
        },
      },
    )
  }

  if (cartQuery.isPending) {
    return (
      <div className="container py-10">
        <Skeleton className="h-9 w-48" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (cartQuery.isError) {
    return (
      <div className="container py-10">
        <ErrorState onRetry={() => cartQuery.refetch()} message="We couldn't load your cart." />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={CartIcon}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start shopping and fill it up!"
          action={
            <Button asChild>
              <Link to="/products">Start shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const checkoutDisabled = cart.items.some((item) => item.product.stockQuantity < item.quantity)

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">Shopping cart</h1>
        <ConfirmDialog
          title="Clear your cart?"
          description="All items will be removed from your cart."
          confirmLabel="Clear cart"
          destructive
          onConfirm={async () => {
            await clearCart.mutateAsync(undefined, {
              onError: (error) => toast.error(cartErrorMessage(error)),
            })
            setAppliedCoupon(null)
            toast.success('Cart cleared')
          }}
          trigger={
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Trash2 className="h-4 w-4" aria-hidden /> Clear cart
            </Button>
          }
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {cart.items.map((item) => (
            <CartRow
              key={item.publicId}
              item={item}
              onQuantityChange={(quantity) => {
                updateItem.mutate(
                  { itemPublicId: item.publicId, quantity },
                  { onError: (error) => toast.error(cartErrorMessage(error)) },
                )
              }}
              onRemove={() => {
                removeItem.mutate(item.publicId, {
                  onError: (error) => toast.error(cartErrorMessage(error)),
                })
              }}
            />
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">Order summary</h2>

              <form onSubmit={applyCoupon} className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                />
                <Button type="submit" variant="secondary" disabled={validateCoupon.isPending}>
                  Apply
                </Button>
              </form>

              {appliedCoupon ? (
                <p className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
                  <Tag className="h-4 w-4" aria-hidden />
                  {appliedCoupon.code} — {formatPrice(appliedCoupon.discount)} off
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tip: try <strong>WELCOME10</strong> for 10% off orders over $50.
                </p>
              )}

              <Separator />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="font-medium tabular-nums text-success">−{formatPrice(discount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium tabular-nums">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                Taxes and final totals are calculated by our system at checkout.
              </p>

              <Button className="w-full" size="lg" onClick={() => navigate('/checkout')} disabled={checkoutDisabled}>
                Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              {checkoutDisabled && (
                <p className="text-center text-xs font-medium text-destructive">
                  Some items exceed available stock — adjust quantities to continue.
                </p>
              )}
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" aria-hidden /> Secure checkout
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

interface CartRowProps {
  item: CartItemResponse
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

function CartRow({ item, onQuantityChange, onRemove }: CartRowProps) {
  const outOfStock = item.product.stockQuantity <= 0
  const insufficient = item.quantity > item.product.stockQuantity

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <Link to={`/products/${item.product.publicId}`} className="shrink-0" aria-label={item.product.name}>
        <ProductImage src={item.product.imageUrl} alt={item.product.name} className="h-24 w-24 rounded-md" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${item.product.publicId}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPrice(item.unitPrice)} each
            </p>
            {(outOfStock || insufficient) && (
              <p className="mt-1 text-xs font-medium text-destructive">
                {outOfStock ? 'This item is currently out of stock.' : `Only ${item.product.stockQuantity} available.`}
              </p>
            )}
          </div>
          <p className="shrink-0 font-semibold tabular-nums">{formatPrice(item.subtotal)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityInput
            value={item.quantity}
            min={1}
            max={Math.max(1, Math.min(99, item.product.stockQuantity))}
            onChange={onQuantityChange}
          />
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground" aria-label={`Remove ${item.product.name} from cart`}>
            <Trash2 className="h-4 w-4" aria-hidden /> Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
