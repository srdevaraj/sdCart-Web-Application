import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badge'
import { Spinner } from '@/components/common/loading-state'
import { ProductImage } from '@/components/common/product-image'
import { useCancelOrder, useOrder, usePayOrder } from '@/features/orders/hooks'
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
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return <ErrorState title="Order not found" message="We couldn't find this order." onRetry={() => orderQuery.refetch()} />
  }

  const awaitingPayment =
    order.status === 'PENDING' && order.payment?.status === 'PENDING' && order.payment.method !== 'CASH_ON_DELIVERY'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to orders
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {order.payment && <PaymentStatusBadge status={order.payment.status} />}
        </div>
      </div>

      {awaitingPayment && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-left">
            <CreditCard className="h-7 w-7 text-warning" aria-hidden />
            <div className="flex-1">
              <p className="font-semibold">Payment pending</p>
              <p className="text-sm text-muted-foreground">Complete payment to confirm your order.</p>
            </div>
            <Button
              onClick={() =>
                payOrder.mutate(order.publicId, {
                  onSuccess: () => toast.success('Payment successful — order confirmed!'),
                  onError: (error) => toast.error(getErrorMessage(error, 'Payment could not be completed')),
                })
              }
              disabled={payOrder.isPending}
            >
              {payOrder.isPending ? <Spinner /> : `Pay ${formatPrice(order.totalAmount)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Items</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.publicId} className="flex items-center gap-3">
                <ProductImage src={item.productImage} alt={item.productName} className="h-16 w-16 rounded-md" />
                <div className="min-w-0 flex-1">
                  {item.productId ? (
                    <Link to={`/products/${item.productId}`} className="text-sm font-medium hover:text-primary">
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium">{item.productName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
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
            {order.couponCode && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Coupon</dt>
                <dd>{order.couponCode}</dd>
              </div>
            )}
            {order.payment && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Payment</dt>
                <dd>
                  {PAYMENT_METHOD_LABELS[order.payment.method]} · {order.payment.transactionId}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-6">
          <Truck className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">Shipping address</p>
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

      {order.status === 'PENDING' && (
        <div className="flex justify-end">
          <ConfirmDialog
            title="Cancel this order?"
            description="Cancelling releases the reserved stock. This cannot be undone."
            confirmLabel="Cancel order"
            destructive
            onConfirm={async () => {
              await cancelOrder.mutateAsync(order.publicId, {
                onError: (error) => toast.error(getErrorMessage(error, 'Could not cancel order')),
              })
              toast.success('Order cancelled')
            }}
            trigger={<Button variant="destructive">Cancel order</Button>}
          />
        </div>
      )}
    </div>
  )
}
