import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badge'
import { useCancelOrder, useOrders } from '@/features/orders/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'

const PAGE_SIZE = 8

export default function OrdersPage() {
  const [page, setPage] = useState(0)
  const ordersQuery = useOrders(page, PAGE_SIZE)
  const cancelOrder = useCancelOrder()

  if (ordersQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    )
  }

  if (ordersQuery.isError) {
    return <ErrorState onRetry={() => ordersQuery.refetch()} message="We couldn't load your orders." />
  }

  const orders = ordersQuery.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage your purchases.</p>
      </header>

      {orders.empty ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order it will appear here."
          action={
            <Button asChild>
              <Link to="/products">Start shopping</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.content.map((order) => (
              <Card key={order.publicId}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link to={`/account/orders/${order.publicId}`} className="font-mono text-sm font-semibold hover:text-primary">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      {order.payment && <PaymentStatusBadge status={order.payment.status} />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-muted-foreground">
                        {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/account/orders/${order.publicId}`}>View details</Link>
                    </Button>
                    {order.status === 'PENDING' && (
                      <ConfirmDialog
                        title="Cancel this order?"
                        description="Cancelling is only possible while the order is pending. Stock will be released."
                        confirmLabel="Cancel order"
                        destructive
                        onConfirm={async () => {
                          await cancelOrder.mutateAsync(order.publicId, {
                            onError: (error) => toast.error(getErrorMessage(error, 'Could not cancel order')),
                          })
                          toast.success('Order cancelled')
                        }}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Cancel
                          </Button>
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            page={orders.page}
            totalPages={orders.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}
    </div>
  )
}
