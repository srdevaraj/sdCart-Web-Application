import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/status-badge'
import { OrderStatusStepper } from '@/components/common/order-status-stepper'
import { Spinner } from '@/components/common/loading-state'
import { ProductImage } from '@/components/common/product-image'
import { Reveal } from '@/components/common/reveal'
import {
  useCancelOrder,
  useOrder,
  usePayOrder,
} from '@/features/orders/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDateTime, formatPrice } from '@/utils/format'
import { PAYMENT_METHOD_LABELS } from '@/types'

export default function OrderDetailPage() {
  const { publicId } = useParams<{ publicId: string }>()

  const orderQuery = useOrder(publicId)
  const cancelOrder = useCancelOrder()
  const payOrder = usePayOrder()

  const order = orderQuery.data

  if (orderQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />

        <Skeleton className="h-[250px] rounded-[28px]" />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Skeleton className="h-[500px] rounded-[28px]" />
          <Skeleton className="h-[300px] rounded-[28px]" />
        </div>

        <Skeleton className="h-[190px] rounded-[28px]" />
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <ErrorState
        title="Order not found"
        message="We couldn't find this order."
        onRetry={() => orderQuery.refetch()}
      />
    )
  }

  const awaitingPayment =
    (order.status === 'PENDING' ||
      order.status === 'AWAITING_PAYMENT' ||
      order.status === 'PAYMENT_FAILED') &&
    order.payment?.status !== 'COMPLETED' &&
    order.payment?.method !== 'CASH_ON_DELIVERY'

  const canCancel =
    order.status === 'PENDING' ||
    order.status === 'AWAITING_PAYMENT' ||
    order.status === 'PAYMENT_FAILED'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================================
          BACK NAVIGATION
      ================================================================= */}
      <Reveal>
        <Link
          to="/account/orders"
          className="group inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-primary/20 hover:bg-primary/[0.03] hover:text-primary hover:shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to orders
        </Link>
      </Reveal>

      {/* ================================================================
          ORDER HERO
      ================================================================= */}
      <Reveal delay={70}>
        <section className="group relative overflow-hidden rounded-[30px] border bg-card shadow-sm transition-all duration-500 hover:shadow-xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/[0.10] blur-3xl transition-transform duration-1000 group-hover:scale-125" />

            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-primary/[0.045] blur-3xl" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              {/* Order identity */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 rounded-3xl bg-primary/10 blur-xl opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border bg-primary/[0.08] text-primary shadow-sm transition-transform duration-500 group-hover:scale-105 sm:h-20 sm:w-20">
                    <Package className="h-7 w-7 sm:h-8 sm:w-8" />

                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Order details
                  </p>

                  <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {order.orderNumber}
                  </h1>

                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                    <Clock3 className="h-3.5 w-3.5" />

                    Placed {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Order status
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                {order.payment && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Payment status
                    </span>
                    <PaymentStatusBadge status={order.payment.status} />
                  </div>
                )}
              </div>
            </div>

            {/* Order progress visual */}
            <div className="mt-8">
              <OrderStatusStepper
                status={order.status}
                createdAt={order.createdAt}
                updatedAt={order.updatedAt}
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================================================================
          PAYMENT NOTICE
      ================================================================= */}
      {awaitingPayment && (
        <Reveal delay={120}>
          <section className="group relative overflow-hidden rounded-[24px] border border-warning/30 bg-warning/[0.045] shadow-sm transition-all duration-500 hover:shadow-lg">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-warning/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />

            <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <CreditCard className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    Payment pending
                  </p>

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                </div>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Complete your payment to confirm this order.
                </p>
              </div>

              <Button
                onClick={() =>
                  payOrder.mutate(order.publicId, {
                    onSuccess: () =>
                      toast.success(
                        'Payment successful — order confirmed!',
                      ),
                    onError: (error) =>
                      toast.error(
                        getErrorMessage(
                          error,
                          'Payment could not be completed',
                        ),
                      ),
                  })
                }
                disabled={payOrder.isPending}
                className="group/pay h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {payOrder.isPending ? (
                  <Spinner />
                ) : (
                  <>
                    Pay {formatPrice(order.totalAmount)}

                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/pay:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </Reveal>
      )}

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* ================================================================
            ITEMS
        ================================================================= */}
        <Reveal delay={160}>
          <Card className="group overflow-hidden rounded-[28px] border shadow-sm transition-all duration-500 hover:shadow-xl">
            <div className="border-b bg-gradient-to-br from-primary/[0.035] to-transparent p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold tracking-tight">
                      Order items
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.items.length}{' '}
                      {order.items.length === 1
                        ? 'item'
                        : 'items'} in this order
                    </p>
                  </div>
                </div>

                <Package className="hidden h-5 w-5 text-muted-foreground/30 sm:block" />
              </div>
            </div>

            <CardContent className="p-5 sm:p-7">
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li
                    key={item.publicId}
                    className="group/item flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-muted/40"
                  >
                    <div className="relative shrink-0 overflow-hidden rounded-xl border bg-muted/20">
                      <ProductImage
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 object-cover transition-transform duration-500 group-hover/item:scale-105 sm:h-24 sm:w-24"
                      />

                      <span className="absolute bottom-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-background/90 px-1 text-[10px] font-bold shadow-sm backdrop-blur">
                        ×{item.quantity}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          {item.productId ? (
                            <Link
                              to={`/products/${item.productId}`}
                              className="group/product inline-flex max-w-full items-center gap-1 text-sm font-semibold transition-colors hover:text-primary"
                            >
                              <span className="truncate">
                                {item.productName}
                              </span>

                              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-300 group-hover/product:translate-x-0.5 group-hover/product:opacity-100" />
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-semibold">
                              {item.productName}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatPrice(item.unitPrice)} ×{' '}
                            {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold tabular-nums">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Separator className="my-6" />

              {/* Order summary */}
              <div className="rounded-2xl border bg-muted/[0.18] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ReceiptIcon />

                  <p className="text-sm font-semibold">
                    Payment summary
                  </p>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Subtotal
                    </dt>

                    <dd className="font-medium tabular-nums">
                      {formatPrice(order.itemsSubtotal)}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Discount
                    </dt>

                    <dd className="font-medium tabular-nums text-success">
                      −{formatPrice(order.discountAmount)}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Shipping
                    </dt>

                    <dd className="font-medium tabular-nums">
                      {Number(order.shippingFee) === 0
                        ? 'Free'
                        : formatPrice(order.shippingFee)}
                    </dd>
                  </div>

                  <Separator />

                  <div className="flex items-end justify-between gap-4 pt-1">
                    <dt>
                      <p className="font-semibold">
                        Total
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Final amount
                      </p>
                    </dt>

                    <dd className="text-xl font-bold tabular-nums tracking-tight">
                      {formatPrice(order.totalAmount)}
                    </dd>
                  </div>

                  {order.couponCode && (
                    <div className="flex justify-between gap-4 pt-2 text-xs text-muted-foreground">
                      <dt>Coupon</dt>

                      <dd className="font-mono font-medium">
                        {order.couponCode}
                      </dd>
                    </div>
                  )}

                  {order.payment && (
                    <div className="flex flex-col gap-1 border-t pt-3 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-4">
                      <dt>Payment</dt>

                      <dd className="text-left sm:text-right">
                        {PAYMENT_METHOD_LABELS[
                          order.payment.method
                        ]}{' '}
                        · {order.payment.transactionId}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* ================================================================
            SIDE INFORMATION
        ================================================================= */}
        <div className="space-y-6">
          {/* Shipping */}
          <Reveal delay={210}>
            <Card className="group overflow-hidden rounded-[28px] border shadow-sm transition-all duration-500 hover:shadow-xl">
              <div className="border-b bg-gradient-to-br from-primary/[0.035] to-transparent p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                    <Truck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Shipping details
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Delivery destination
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">
                      {order.shippingAddress.recipientName}
                    </p>

                    <p className="mt-2 leading-6 text-muted-foreground">
                      {order.shippingAddress.line1}

                      {order.shippingAddress.line2
                        ? `, ${order.shippingAddress.line2}`
                        : ''}
                      , {order.shippingAddress.city}
                      {order.shippingAddress.state
                        ? `, ${order.shippingAddress.state}`
                        : ''}{' '}
                      {order.shippingAddress.postalCode},{' '}
                      {order.shippingAddress.country}
                    </p>

                    <p className="mt-3 border-t pt-3 text-xs font-medium text-muted-foreground">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Security / order assurance */}
          <Reveal delay={250}>
            <div className="rounded-[28px] border bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Order information protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your order and payment information is securely
                    associated with your account.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ================================================================
          CANCEL ORDER
      ================================================================= */}
      {canCancel && (
        <Reveal delay={290}>
          <div className="flex flex-col gap-4 rounded-[24px] border bg-card/60 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Need to cancel this order?
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Cancellation is available while the order is still
                pending. Reserved stock will be released.
              </p>
            </div>

            <ConfirmDialog
              title="Cancel this order?"
              description="Cancelling releases the reserved stock. This cannot be undone."
              confirmLabel="Cancel order"
              destructive
              onConfirm={async () => {
                await cancelOrder.mutateAsync(order.publicId, {
                  onError: (error) =>
                    toast.error(
                      getErrorMessage(
                        error,
                        'Could not cancel order',
                      ),
                    ),
                })

                toast.success('Order cancelled')
              }}
              trigger={
                <Button
                  variant="destructive"
                  className="h-10 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Cancel order
                </Button>
              }
            />
          </div>
        </Reveal>
      )}

      {/* ================================================================
          FOOTER NAVIGATION
      ================================================================= */}
      <Reveal delay={320}>
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/account/orders"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Return to order history
          </Link>

          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Continue shopping

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

/**
 * Small local icon component keeps the payment-summary
 * header visually consistent without changing application logic.
 */
function ReceiptIcon() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <CreditCard className="h-3.5 w-3.5" />
    </div>
  )
}