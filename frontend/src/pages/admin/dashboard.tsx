import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
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
import { DashboardSection } from '@/components/admin/dashboard-section'
import { useAdminOrders, useAdminProducts, useAdminUsers } from '@/features/admin/hooks'
import { formatDate, formatPrice } from '@/utils/format'
import { RevenueChart } from '@/components/admin/charts/revenue-chart'
import { PaymentDonutChart } from '@/components/admin/charts/payment-donut-chart'
import { OrderStatusChart } from '@/components/admin/charts/order-status-chart'

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

  if (products.isPending || users.isPending || orders.isPending) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
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
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store overview, financial performance, and fulfillment management.
        </p>
      </header>

      {/* =================================================================== */}
      {/* SECTION 1: PAYMENTS & REVENUE (Top of page)                        */}
      {/* =================================================================== */}
      <DashboardSection
        title="Payments & Revenue"
        subtitle="Financial performance, multi-year revenue trends, and transaction statuses."
        icon={<CreditCard className="h-5 w-5" />}
      >
        <div className="space-y-6">
          {/* Revenue Stat Card */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border bg-card/90 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <IndianRupee className="h-5 w-5 text-primary" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recent
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                  {formatPrice(revenue)}
                </p>
                <p className="text-xs text-muted-foreground">Total Revenue (recent)</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart & Payment Donut */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <PaymentDonutChart />
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* =================================================================== */}
      {/* SECTION 2: ORDERS & FULFILLMENT (Directly below Payments)         */}
      {/* =================================================================== */}
      <DashboardSection
        title="Orders & Fulfillment"
        subtitle="Order volume, status distribution, and recent customer activity."
        icon={<ShoppingCart className="h-5 w-5" />}
        headerAction={
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/admin/orders" className="gap-1.5 text-xs font-semibold">
              View all orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Order Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border bg-card/90 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <ShoppingCart className="h-5 w-5 text-primary" aria-hidden />
                  <Link
                    to="/admin/orders"
                    className="text-xs text-muted-foreground hover:text-primary"
                    aria-label="View Orders"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                  {orders.data ? String(orders.data.totalElements) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/90 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-5 w-5 text-warning" aria-hidden />
                  <Link
                    to="/admin/orders?status=PENDING"
                    className="text-xs text-muted-foreground hover:text-primary"
                    aria-label="View Pending Orders"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                  {pendingOrders.data ? String(pendingOrders.data.totalElements) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Pending Orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Chart & Recent Orders List */}
          <div className="grid gap-6 lg:grid-cols-2">
            <OrderStatusChart />

            <Card className="border shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Recent Orders</CardTitle>
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
                      <li
                        key={order.publicId}
                        className="flex items-center justify-between gap-3 px-6 py-3 text-sm hover:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/admin/orders/${order.publicId}`}
                            className="font-mono font-semibold hover:text-primary"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <OrderStatusBadge status={order.status} />
                          <span className="font-semibold tabular-nums">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardSection>

      {/* =================================================================== */}
      {/* SECTION 3: CATALOG & INVENTORY (Below Orders)                      */}
      {/* =================================================================== */}
      <DashboardSection
        title="Catalog & Inventory"
        subtitle="Active product catalog health and low stock alerts."
        icon={<Package className="h-5 w-5" />}
        headerAction={
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/admin/products" className="gap-1.5 text-xs font-semibold">
              Manage products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border bg-card/90 shadow-sm lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Package className="h-5 w-5 text-primary" aria-hidden />
                <Link
                  to="/admin/products"
                  className="text-xs text-muted-foreground hover:text-primary"
                  aria-label="View Products"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                {products.data ? String(products.data.totalElements) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Total Catalog Products</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Low Stock Alerts</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/inventory">Manage inventory</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {lowStock.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  All stocked products are healthy. 🎉
                </p>
              ) : (
                <ul className="divide-y">
                  {lowStock.map((product) => (
                    <li
                      key={product.publicId}
                      className="flex items-center justify-between gap-3 px-6 py-3 text-sm hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/admin/products`}
                          className="line-clamp-1 font-medium hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {product.sku ?? product.slug}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
      </DashboardSection>

      {/* =================================================================== */}
      {/* SECTION 4: CUSTOMERS & ACCOUNTS (Below Inventory)                 */}
      {/* =================================================================== */}
      <DashboardSection
        title="Customers & Accounts"
        subtitle="Registered customer base and account metrics."
        icon={<Users className="h-5 w-5" />}
        headerAction={
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/admin/users" className="gap-1.5 text-xs font-semibold">
              View customers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border bg-card/90 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-primary" aria-hidden />
                <Link
                  to="/admin/users"
                  className="text-xs text-muted-foreground hover:text-primary"
                  aria-label="View Customers"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">
                {users.data ? String(users.data.totalElements) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Registered Customers</p>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>
    </div>
  )
}
