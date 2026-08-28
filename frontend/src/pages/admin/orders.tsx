import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/status-badge'
import { RefundReviewModal } from '@/components/admin/refund-review-modal'
import { useAdminOrders, useUpdateOrderStatus } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderResponse, type OrderStatus } from '@/types'

/** Valid admin transitions enforced by the backend. */
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  AWAITING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  PAYMENT_FAILED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  REFUND_REQUESTED: ['CANCELLED'],
}

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<OrderResponse | null>(null)

  const statusParam = searchParams.get('status')
  const status = (ORDER_STATUSES.includes(statusParam as OrderStatus) ? statusParam : undefined) as
    | OrderStatus
    | undefined

  const ordersQuery = useAdminOrders(status, page, 20)
  const updateStatus = useUpdateOrderStatus()

  const orders = ordersQuery.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders ? `${orders.totalElements} orders` : 'Manage customer orders'}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button variant={!status ? 'default' : 'outline'} size="sm" onClick={() => { setSearchParams({}); setPage(0) }}>
          All
        </Button>
        {ORDER_STATUSES.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSearchParams({ status: s })
              setPage(0)
            }}
          >
            {ORDER_STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      {ordersQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState onRetry={() => ordersQuery.refetch()} message="We couldn't load orders." />
      ) : !orders ? null : orders.empty ? (
        <EmptyState title="No orders found" description="Orders will appear here once customers place them." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 text-left">Order</th>
                  <th className="px-4 py-3.5 text-left">Date</th>
                  <th className="px-4 py-3.5 text-left">Items</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.content.map((order) => {
                  const next = NEXT_STATUSES[order.status] ?? []
                  const isRefundRequested = order.status === 'REFUND_REQUESTED'
                  return (
                    <tr key={order.publicId} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                        <Link
                          to={`/admin/orders/${order.publicId}`}
                          className="font-mono text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle text-xs text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle font-semibold tabular-nums">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                        <div className="flex justify-center">
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRefundRequested && (
                            <Button
                              size="sm"
                              className="h-8 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700"
                              onClick={() => setSelectedRefundOrder(order)}
                            >
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                              Refund
                            </Button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs"
                              onClick={() => setSelectedRefundOrder(order)}
                            >
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                              Refund
                            </Button>
                          )}
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
                                    onError: (error) =>
                                      toast.error(getErrorMessage(error, 'Could not update order status')),
                                  },
                                )
                              }
                            >
                              {ORDER_STATUS_LABELS[target]}
                            </Button>
                          ))}
                          {next.length === 0 && !isRefundRequested && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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

      {/* Review Refund Modal */}
      <RefundReviewModal
        order={selectedRefundOrder}
        open={!!selectedRefundOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedRefundOrder(null)
        }}
      />
    </div>
  )
}