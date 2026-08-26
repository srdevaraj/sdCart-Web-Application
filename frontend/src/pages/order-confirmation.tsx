import { Link, useParams } from 'react-router-dom'
import { AlertCircle, AlertOctagon, CheckCircle2, Clock, CreditCard, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { Spinner } from '@/components/common/loading-state'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badge'
import { ProductImage } from '@/components/common/product-image'
import { useOrder, usePayOrder } from '@/features/orders/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'
import { PAYMENT_METHOD_LABELS } from '@/types'

export default function OrderConfirmationPage() {
  const { publicId } = useParams<{ publicId: string }>()
  const orderQuery = useOrder(publicId)
  const payOrder = usePayOrder()

  const order = orderQuery.data
  const awaitingPayment =
    order != null &&
    (order.status === 'PENDING' ||
      order.status === 'AWAITING_PAYMENT' ||
      order.status === 'PAYMENT_FAILED') &&
    order.payment?.status !== 'COMPLETED' &&
    order.payment?.method !== 'CASH_ON_DELIVERY'

  function handlePay() {
    if (!order) return
    payOrder.mutate(order.publicId, {
      onSuccess: () => toast.success('Payment successful! Your order is confirmed.'),
      onError: (error) => toast.error(getErrorMessage(error, 'Payment could not be completed')),
    })
  }

  if (orderQuery.isPending) {
    return (
      <div className="container py-12">
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-72" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="container py-12">
        <ErrorState
          title="Order not found"
          message="We couldn't find this order. It may have been removed."
          onRetry={() => orderQuery.refetch()}
        />
      </div>
    )
  }

  const isConfirmed = order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED'
  const isPaymentFailed = order.status === 'PAYMENT_FAILED'
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="container max-w-3xl py-12">
      <div className="text-center">
        {isConfirmed ? (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Thank you for your order!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your order {order.orderNumber} is confirmed. A confirmation was sent to your account.
            </p>
          </>
        ) : isPaymentFailed ? (
          <>
            <AlertCircle className="mx-auto h-16 w-16 text-destructive" aria-hidden />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Payment Failed
            </h1>
            <p className="mt-2 text-muted-foreground">
              Payment for order {order.orderNumber} could not be processed. Please complete payment to confirm your order.
            </p>
          </>
        ) : isCancelled ? (
          <>
            <AlertOctagon className="mx-auto h-16 w-16 text-destructive" aria-hidden />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Order cancelled
            </h1>
            <p className="mt-2 text-muted-foreground">
              Order {order.orderNumber} has been cancelled.
            </p>
          </>
        ) : (
          <>
            <Clock className="mx-auto h-16 w-16 text-warning" aria-hidden />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
              Order Placed — Awaiting Payment
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your order {order.orderNumber} has been created. Please complete payment to confirm your order.
            </p>
          </>
        )}
      </div>

      {awaitingPayment && (
        <Card className="mt-8 border-warning/40 bg-warning/5">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
            <CreditCard className="h-8 w-8 text-warning" aria-hidden />
            <div className="flex-1">
              <p className="font-semibold">
                {isPaymentFailed ? 'Retry your payment' : 'Complete your payment'}
              </p>
              <p className="text-sm text-muted-foreground">
                Your order is saved. Complete payment with the gateway to confirm it.
              </p>
            </div>
            <Button onClick={handlePay} disabled={payOrder.isPending}>
              {payOrder.isPending ? <Spinner /> : `Pay ${formatPrice(order.totalAmount)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Order number</p>
              <p className="font-mono font-semibold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Placed on</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <OrderStatusBadge status={order.status} />
              {order.payment && <PaymentStatusBadge status={order.payment.status} />}
            </div>
          </div>

          <Separator />

          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.publicId} className="flex items-center gap-3">
                <ProductImage src={item.productImage} alt={item.productName} className="h-16 w-16 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatPrice(item.subtotal)}</p>
              </li>
            ))}
          </ul>

          <Separator />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.itemsSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums text-success">−{formatPrice(order.discountAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{Number(order.shippingFee) === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold tabular-nums">{formatPrice(order.totalAmount)}</dd>
            </div>
            {order.payment && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Payment method</dt>
                <dd>{PAYMENT_METHOD_LABELS[order.payment.method]}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="flex items-start gap-3 p-6">
          <Truck className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">Shipping to</p>
            <p className="mt-1 text-muted-foreground">
              {order.shippingAddress.recipientName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/account/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
