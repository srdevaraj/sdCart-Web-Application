import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { OrderStatusBadge } from '@/components/common/status-badge'
import { useAdminOrders, useAdminProducts, useAdminUsers } from '@/features/admin/hooks'
import { formatDate, formatPrice } from '@/utils/format'

export default function AdminDashboardPage() {
  const products = useAdminProducts(undefined, undefined, 0, 100)
  const users = useAdminUsers(undefined, 0, 1)
  const orders = useAdminOrders(undefined, 0, 8)
  const pendingOrders = useAdminOrders('PENDING', 0, 1)

  const allProducts = products.data?.content ?? []
  const lowStock = allProducts
    .filter((p) => p.status === 'ACTIVE' && p.stockQuantity <= 10)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 5)

  const recentOrders = orders.data?.content ?? []
  const revenue = recentOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const stats: Array<{ label: string; value: string; icon: typeof Package; to?: string }> = [
    { label: 'Products', value: products.data ? String(products.data.totalElements) : '—', icon: Package, to: '/admin/products' },
    { label: 'Customers', value: users.data ? String(users.data.totalElements) : '—', icon: Users, to: '/admin/users' },
    { label: 'Orders', value: orders.data ? String(orders.data.totalElements) : '—', icon: ShoppingCart, to: '/admin/orders' },
    {
      label: 'Pending orders',
      value: pendingOrders.data ? String(pendingOrders.data.totalElements) : '—',
      icon: AlertTriangle,
      to: '/admin/orders?status=PENDING',
    },
    { label: 'Revenue (recent)', value: formatPrice(revenue), icon: IndianRupee },
  ]

  if (products.isPending || users.isPending || orders.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }

  if (products.isError || users.isError || orders.isError) {
    return (
      <ErrorState
        onRetry={() => {
          products.refetch()
          users.refetch()
          orders.refetch()
        }}
        message="We couldn't load the dashboard."
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store overview and quick actions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                {to && (
                  <Link to={to} className="text-xs text-muted-foreground hover:text-primary" aria-label={`View ${label}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="divide-y">
                {recentOrders.map((order) => (
                  <li key={order.publicId} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-mono font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold tabular-nums">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Low stock</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/inventory">Manage inventory</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {lowStock.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">All stocked products are healthy. 🎉</p>
            ) : (
              <ul className="divide-y">
                {lowStock.map((product) => (
                  <li key={product.publicId} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                    <div className="min-w-0">
                      <Link to={`/admin/products`} className="line-clamp-1 font-medium hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.sku ?? product.slug}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.stockQuantity === 0
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {product.stockQuantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
