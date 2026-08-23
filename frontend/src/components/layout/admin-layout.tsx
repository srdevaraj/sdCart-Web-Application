import { NavLink, Outlet } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  CreditCard,
  Image,
  LayoutDashboard,
  Package,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
  Warehouse,
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Banner Products', to: '/admin/banner-products', icon: Image },
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
  const prefersReducedMotion = useReducedMotion()

  // Container motion variants
  const sidebarVariants: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header Bar */}
      <div className="border-b bg-background/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Admin Portal
            </span>
          </div>
          <NavLink
            to="/"
            className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to store</span>
          </NavLink>
        </div>
      </div>

      <div className="container grid gap-6 py-6 lg:grid-cols-[250px_1fr]">
        {/* ============================================================
            ANIMATED ADMIN SIDEBAR
        ============================================================ */}
        <motion.aside
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          variants={sidebarVariants}
          className="w-full"
        >
          <div className="relative rounded-2xl border border-border/80 bg-card/70 p-3 shadow-xl backdrop-blur-xl">
            {/* Header Badge */}
            <div className="mb-3 flex items-center gap-2.5 px-3 pt-1 pb-2 border-b border-border/60">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Management Hub
                </p>
                <p className="text-[10px] text-muted-foreground">Store administration</p>
              </div>
            </div>

            <nav aria-label="Admin" className="flex gap-1.5 overflow-x-auto lg:flex-col no-scrollbar">
              {NAV.map(({ label, to, icon: Icon, end }) => (
                <motion.div key={to} variants={itemVariants}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 outline-none',
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Sliding Background Pill */}
                        {isActive && (
                          <motion.div
                            layoutId={prefersReducedMotion ? undefined : 'active-admin-pill'}
                            className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/30 shadow-sm"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}

                        {/* Active Left Indicator Bar */}
                        {isActive && (
                          <motion.div
                            layoutId={prefersReducedMotion ? undefined : 'active-admin-bar'}
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-glow hidden lg:block"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}

                        {/* Icon with hover rotation micro-interaction */}
                        <span className="relative z-10 flex items-center justify-center">
                          <Icon
                            className={cn(
                              'h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6',
                              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                            )}
                            aria-hidden
                          />
                        </span>

                        {/* Nav Label */}
                        <span className="relative z-10 transition-colors duration-200">
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Main Admin Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
