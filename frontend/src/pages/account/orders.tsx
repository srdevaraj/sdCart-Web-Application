import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Package,
  ReceiptText,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/common/status-badge'
import { Reveal } from '@/components/common/reveal'
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
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Hero skeleton */}
        <Skeleton className="h-[230px] rounded-[28px]" />

        {/* Order skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-[210px] rounded-[24px]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (ordersQuery.isError) {
    return (
      <ErrorState
        onRetry={() => ordersQuery.refetch()}
        message="We couldn't load your orders."
      />
    )
  }

  const orders = ordersQuery.data

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================================
          ORDERS HERO
      ================================================================= */}
      <Reveal>
        <section className="group relative overflow-hidden rounded-[28px] border bg-card shadow-sm transition-all duration-500 hover:shadow-xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-primary/[0.11] blur-3xl transition-transform duration-1000 group-hover:scale-125" />

            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary/[0.055] blur-3xl" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent" />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_auto]">
            {/* Main hero content */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Icon */}
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute -inset-3 rounded-3xl bg-primary/[0.08] blur-xl opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-primary/[0.08] text-primary shadow-sm transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
                    <ShoppingBag className="h-9 w-9 sm:h-10 sm:w-10" />

                    <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-md">
                      {orders.totalElements}
                    </span>
                  </div>
                </div>

                {/* Heading */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Your purchases
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Orders & purchases
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mx-0 sm:text-base">
                    Keep track of your purchases, view order details, and
                    manage pending orders from one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary panel */}
            <div className="border-t bg-background/50 p-6 backdrop-blur-sm lg:w-[290px] lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order history
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {orders.totalElements}{' '}
                      {orders.totalElements === 1
                        ? 'order'
                        : 'orders'}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ReceiptText className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Purchase history
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {orders.totalElements === 0
                            ? 'No purchases yet'
                            : 'Your recent purchases'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-5">
                  <Link
                    to="/products"
                    className="group/shop inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Continue shopping

                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/shop:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================================================================
          EMPTY STATE
      ================================================================= */}
      {orders.empty ? (
        <Reveal delay={100}>
          <div className="rounded-[28px] border bg-card p-8 shadow-sm sm:p-12">
            <EmptyState
              icon={Package}
              title="Your order history is empty"
              description="Once you place your first order, you'll be able to track and manage it here."
              action={
                <Button
                  asChild
                  className="group h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Link to="/products">
                    Start shopping

                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              }
            />
          </div>
        </Reveal>
      ) : (
        <>
          {/* ================================================================
              ORDER LIST HEADER
          ================================================================= */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Recent activity
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Your orders
                </h2>
              </div>

              <p className="text-xs text-muted-foreground">
                Showing {orders.content.length} of {orders.totalElements}{' '}
                orders
              </p>
            </div>
          </Reveal>

          {/* ================================================================
              ORDER CARDS
          ================================================================= */}
          <div className="space-y-4">
            {orders.content.map((order, index) => (
              <Reveal
                key={order.publicId}
                delay={120 + index * 45}
              >
                <Card className="group overflow-hidden rounded-[24px] border shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="p-0">
                    {/* Top section */}
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent p-5 sm:p-6">
                      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.045] blur-3xl transition-transform duration-700 group-hover:scale-125" />

                      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Order identity */}
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                            <Package className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <Link
                              to={`/account/orders/${order.publicId}`}
                              className="group/order inline-flex max-w-full items-center gap-1.5 font-mono text-sm font-semibold transition-colors hover:text-primary"
                            >
                              <span className="truncate">
                                {order.orderNumber}
                              </span>

                              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-300 group-hover/order:translate-x-0.5 group-hover/order:opacity-100" />
                            </Link>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" />

                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Statuses */}
                        <div className="flex flex-wrap items-center gap-2">
                          <OrderStatusBadge status={order.status} />

                          {order.payment && (
                            <PaymentStatusBadge
                              status={order.payment.status}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle section */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Products */}
                        <div className="min-w-0 flex-1">
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Items
                          </p>

                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {order.items
                              .map(
                                (item) =>
                                  `${item.productName} × ${item.quantity}`,
                              )
                              .join(', ')}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="shrink-0 sm:min-w-[150px] sm:text-right">
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Order total
                          </p>

                          <p className="text-xl font-bold tabular-nums tracking-tight">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex flex-col gap-3 border-t bg-muted/[0.18] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="hidden text-xs text-muted-foreground sm:block">
                        View complete order information and status.
                      </p>

                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="group/details h-9 flex-1 rounded-lg transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.04] sm:flex-none"
                        >
                          <Link
                            to={`/account/orders/${order.publicId}`}
                          >
                            View details

                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover/details:translate-x-0.5" />
                          </Link>
                        </Button>

                        {order.status === 'PENDING' && (
                          <ConfirmDialog
                            title="Cancel this order?"
                            description="Cancelling is only possible while the order is pending. Stock will be released."
                            confirmLabel="Cancel order"
                            destructive
                            onConfirm={async () => {
                              await cancelOrder.mutateAsync(
                                order.publicId,
                                {
                                  onError: (error) =>
                                    toast.error(
                                      getErrorMessage(
                                        error,
                                        'Could not cancel order',
                                      ),
                                    ),
                                },
                              )

                              toast.success('Order cancelled')
                            }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 flex-1 rounded-lg text-destructive transition-all duration-300 hover:bg-destructive/5 hover:text-destructive sm:flex-none"
                              >
                                Cancel
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* ================================================================
              PAGINATION
          ================================================================= */}
          <Reveal delay={180}>
            <div className="pt-2">
              <Pagination
                page={orders.page}
                totalPages={orders.totalPages}
                onPageChange={(next) => {
                  setPage(next)

                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }}
              />
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}