import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/status-badge'
import { OrderStatusStepper } from '@/components/common/order-status-stepper'
import { ProductImage } from '@/components/common/product-image'
import { Spinner } from '@/components/common/loading-state'
import { Reveal } from '@/components/common/reveal'
import { useAdminOrder, useUpdateOrderStatus } from '@/features/admin/hooks'
import { formatDateTime, formatPrice } from '@/utils/format'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type OrderStatus } from '@/types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-client'

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
}

export default function AdminOrderDetailPage() {
  const { publicId } = useParams<{ publicId: string }>()
  const orderQuery = useAdminOrder(publicId)
  const updateStatus = useUpdateOrderStatus()

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

  const next = NEXT_STATUSES[order.status] ?? []

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* Back navigation */}
      <Reveal>
        <Link
          to="/admin/orders"
          className="group inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-primary/20 hover:bg-primary/[0.03] hover:text-primary hover:shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to orders
        </Link>
      </Reveal>

      {/* Order hero */}
      <Reveal delay={70}>
        <section className="group relative overflow-hidden rounded-[30px] border bg-card shadow-sm">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border bg-primary/[0.08] text-primary shadow-sm sm:h-20 sm:w-20">
                  <Package className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Admin order view
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

              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {order.payment && (
                  <PaymentStatusBadge status={order.payment.status} />
                )}
              </div>
            </div>

            {/* Status actions */}
            {next.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                {next.map((target) => (
                  <Button
                    key={target}
                    variant={target === 'CANCELLED' ? 'outline' : 'secondary'}
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate(
                        { publicId: order.publicId, status: target },
                        {
                          onSuccess: () => toast.success(`Order marked ${ORDER_STATUS_LABELS[target].toLowerCase()}`),
                          onError: (error) => toast.error(getErrorMessage(error, 'Could not update order status')),
                        },
                      )
                    }
                  >
                    {updateStatus.isPending ? <Spinner className="mr-2 h-3 w-3" /> : null}
                    Mark as {ORDER_STATUS_LABELS[target]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* Stepper tracking */}
      <Reveal delay={90}>
        <OrderStatusStepper
          status={order.status}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
        />
      </Reveal>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Items */}
        <Reveal delay={120}>
          <Card className="overflow-hidden rounded-[28px] border shadow-sm">
            <div className="border-b bg-gradient-to-br from-primary/[0.035] to-transparent p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Order items</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-5 sm:p-7">
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.publicId} className="flex gap-4 rounded-2xl p-3 transition-colors hover:bg-muted/40">
                    <div className="relative shrink-0 overflow-hidden rounded-xl border bg-muted/20">
                      <ProductImage
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                      />
                      <span className="absolute bottom-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-background/90 px-1 text-[10px] font-bold shadow-sm">
                        ×{item.quantity}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.productName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Separator className="my-6" />

              {/* Payment summary */}
              <div className="rounded-2xl border bg-muted/[0.18] p-5">
                <p className="mb-4 text-sm font-semibold">Payment summary</p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium tabular-nums">{formatPrice(order.itemsSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="font-medium tabular-nums text-success">−{formatPrice(order.discountAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-medium tabular-nums">
                      {Number(order.shippingFee) === 0 ? 'Free' : formatPrice(order.shippingFee)}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex items-end justify-between gap-4 pt-1">
                    <dt>
                      <p className="font-semibold">Total</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">Final amount</p>
                    </dt>
                    <dd className="text-xl font-bold tabular-nums tracking-tight">{formatPrice(order.totalAmount)}</dd>
                  </div>
                  {order.couponCode && (
                    <div className="flex justify-between gap-4 pt-2 text-xs text-muted-foreground">
                      <dt>Coupon</dt>
                      <dd className="font-mono font-medium">{order.couponCode}</dd>
                    </div>
                  )}
                  {order.payment && (
                    <div className="flex flex-col gap-1 border-t pt-3 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-4">
                      <dt>Payment</dt>
                      <dd className="text-left sm:text-right">
                        {PAYMENT_METHOD_LABELS[order.payment.method]} · {order.payment.transactionId}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Side information */}
        <div className="space-y-6">
          {/* Customer shipping */}
          <Reveal delay={170}>
            <Card className="overflow-hidden rounded-[28px] border shadow-sm">
              <div className="border-b bg-gradient-to-br from-primary/[0.035] to-transparent p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Shipping details</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Customer delivery address</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{order.shippingAddress.recipientName}</p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''},{' '}
                      {order.shippingAddress.city}
                      {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                      {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                    <p className="mt-3 border-t pt-3 text-xs font-medium text-muted-foreground">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Security */}
          <Reveal delay={210}>
            <div className="rounded-[28px] border bg-card/70 p-6 shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Order information protected</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Customer and payment information is securely stored and only visible to administrators.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Footer navigation */}
      <Reveal delay={250}>
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin/orders"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Return to orders list
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
