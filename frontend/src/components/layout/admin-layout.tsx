import { NavLink, Outlet } from 'react-router-dom'
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
  Warehouse,
} from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Inventory', to: '/admin/inventory', icon: Warehouse },
  { label: 'Categories', to: '/admin/categories', icon: Boxes },
  { label: 'Brands', to: '/admin/brands', icon: Tags },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Coupons', to: '/admin/coupons', icon: TicketPercent },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <NavLink to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
            ← Back to store
          </NavLink>
        </div>
      </div>
      <div className="container grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <nav aria-label="Admin" className="flex gap-1 overflow-x-auto rounded-lg border bg-background p-2 lg:flex-col">
            {NAV.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
