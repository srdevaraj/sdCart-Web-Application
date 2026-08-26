import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Spinner } from '@/components/common/loading-state'
import { ProductImage } from '@/components/common/product-image'
import { AddressForm } from '@/features/addresses/address-form'
import { useAddresses } from '@/features/addresses/hooks'
import { useCart } from '@/features/cart/hooks'
import { usePlaceOrder, usePayOrder } from '@/features/orders/hooks'
import { useValidateCoupon } from '@/features/coupons/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type CreateOrderRequest,
} from '@/types'

const FREE_SHIPPING_THRESHOLD = 50
const FLAT_SHIPPING = 5

export default function CheckoutPage() {
  const navigate = useNavigate()
  const cartQuery = useCart()
  const addressesQuery = useAddresses()
  const placeOrder = usePlaceOrder()
  const payOrder = usePayOrder()
  const validateCoupon = useValidateCoupon()

  const [addressId, setAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const cart = cartQuery.data
  const addresses = addressesQuery.data
  const subtotal = Number(cart?.totalAmount ?? 0)
  const discount = appliedCoupon?.discount ?? 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const shipping = cart && cart.totalQuantity > 0 ? (afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING) : 0
  const total = afterDiscount + shipping

  function applyCoupon() {
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
            toast.error(result.message || 'This coupon is not valid')
          }
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not validate coupon')),
      },
    )
  }

  async function handlePlaceOrder() {
    if (!addressId) {
      toast.error('Please select a shipping address')
      return
    }
    const payload: CreateOrderRequest = {
      addressId,
      paymentMethod,
      couponCode: appliedCoupon?.code,
    }
    try {
      const order = await placeOrder.mutateAsync(payload)

      // Cash On Delivery is immediately confirmed on order creation
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        toast.success('Order placed successfully!')
        navigate(`/order-confirmation/${order.publicId}`)
        return
      }

      // Card & PayPal go through payment gateway verification before confirmation
      toast.info('Processing payment…')
      try {
        await payOrder.mutateAsync(order.publicId)
        toast.success('Payment successful! Your order is confirmed.')
        navigate(`/order-confirmation/${order.publicId}`)
      } catch (payError) {
        toast.error(getErrorMessage(payError, 'Payment could not be completed. Your order is saved as pending.'))
        navigate(`/order-confirmation/${order.publicId}`)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'We could not place your order'))
    }
  }

  if (cartQuery.isPending || addressesQuery.isPending) {
    return (
      <div className="container py-10">
        <Skeleton className="h-9 w-56" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (cartQuery.isError || addressesQuery.isError) {
    return (
      <div className="container py-10">
        <ErrorState
          onRetry={() => {
            cartQuery.refetch()
            addressesQuery.refetch()
          }}
          message="We couldn't load your checkout details."
        />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Nothing to check out"
          description="Your cart is empty. Add some products first."
          action={
            <Button asChild>
              <Link to="/products">Continue shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const checkoutDisabled = placeOrder.isPending || cart.items.some((i) => i.quantity > i.product.stockQuantity)

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Shipping address */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden /> Shipping address
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddressForm((s) => !s)}>
                <Plus className="h-4 w-4" aria-hidden /> {showAddressForm ? 'Close' : 'Add new'}
              </Button>
            </CardHeader>
            <CardContent>
              {addresses && addresses.length > 0 ? (
                <RadioGroup
                  value={addressId ?? undefined}
                  onValueChange={setAddressId}
                  aria-label="Shipping address"
                  className="gap-2"
                >
                  {addresses.map((address) => (
                    <label
                      key={address.publicId}
                      className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40"
                    >
                      <RadioGroupItem value={address.publicId} id={`addr-${address.publicId}`} className="mt-0.5" />
                      <span className="text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          {address.label}
                          {address.isDefault && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-muted-foreground">
                          {address.recipientName} · {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}, {address.city}
                          {address.state ? `, ${address.state}` : ''} {address.postalCode}, {address.country}
                          <br />
                          {address.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">No saved addresses yet — add one to continue.</p>
              )}

              {showAddressForm && (
                <div className="mt-4 rounded-md border p-4">
                  <AddressForm
                    onSuccess={() => {
                      setShowAddressForm(false)
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" aria-hidden /> Payment method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} aria-label="Payment method" className="gap-2">
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-medium has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40"
                  >
                    <RadioGroupItem value={method} id={`pay-${method}`} />
                    {PAYMENT_METHOD_LABELS[method]}
                  </label>
                ))}
              </RadioGroup>
              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Pay in cash when your order arrives. A small convenience applies at checkout.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                aria-label="Coupon code"
              />
              <Button variant="secondary" onClick={applyCoupon} disabled={validateCoupon.isPending || !couponCode.trim()}>
                Apply
              </Button>
            </CardContent>
            {appliedCoupon && (
              <CardContent className="pt-0">
                <p className="rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
                  {appliedCoupon.code} applied — {formatPrice(appliedCoupon.discount)} off
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Summary */}
        <aside>
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {cart.items.map((item) => (
                  <li key={item.publicId} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <ProductImage src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-md" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} each</p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">{formatPrice(item.subtotal)}</p>
                  </li>
                ))}
              </ul>

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
                  <dd className="font-medium tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <Button className="w-full" size="lg" onClick={() => void handlePlaceOrder()} disabled={checkoutDisabled}>
                {placeOrder.isPending ? (
                  <>
                    <Spinner /> Placing order…
                  </>
                ) : (
                  `Place order · ${formatPrice(total)}`
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By placing this order you agree to our{' '}
                <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link>.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
