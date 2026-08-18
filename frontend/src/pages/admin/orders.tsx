import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/status-badge'
import { useAdminOrders, useUpdateOrderStatus } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

/** Valid admin transitions enforced by the backend. */
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
}

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
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
              setSearchParams(s === 'PENDING' ? { status: s } : { status: s })
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
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Update status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.content.map((order) => {
                  const next = NEXT_STATUSES[order.status] ?? []
                  return (
                    <tr key={order.publicId} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/orders/${order.publicId}`}
                          className="font-mono font-medium hover:text-primary"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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
                          {next.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
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
    </div>
  )
}
