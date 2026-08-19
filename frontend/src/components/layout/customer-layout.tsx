import { NavLink, Outlet } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  User,
  UserCheck,
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'Profile', to: '/account/profile', icon: User },
  { label: 'My Orders', to: '/account/orders', icon: Package },
  { label: 'Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'My Reviews', to: '/account/reviews', icon: Star },
  { label: 'Shopping Cart', to: '/cart', icon: ShoppingBag },
]

const SHOPPING_LINK = { label: 'Back to Shopping', to: '/products', icon: ArrowLeft }

export function CustomerLayout() {
  const prefersReducedMotion = useReducedMotion()

  // Typed container motion variants
  const sidebarVariants: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
        staggerChildren: 0.05,
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
    <div className="container grid gap-8 py-8 md:grid-cols-[240px_1fr]">
      {/* ============================================================
          ANIMATED CUSTOMER SIDEBAR
      ============================================================ */}
      <motion.aside
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        variants={sidebarVariants}
        className="w-full"
      >
        <div className="relative rounded-2xl border border-border/80 bg-card/60 p-3 shadow-xl backdrop-blur-xl">
          {/* Header Badge */}
          <div className="mb-3 flex items-center gap-2.5 px-3 pt-1 pb-2 border-b border-border/60">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
              <UserCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Account Portal
              </p>
              <p className="text-[10px] text-muted-foreground">Manage your preferences</p>
            </div>
          </div>

          <nav aria-label="Account" className="flex gap-1.5 overflow-x-auto md:flex-col no-scrollbar">
            {LINKS.map(({ label, to, icon: Icon }) => (
              <motion.div key={to} variants={itemVariants}>
                <NavLink
                  to={to}
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
                          layoutId={prefersReducedMotion ? undefined : 'active-customer-pill'}
                          className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/30 shadow-sm"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId={prefersReducedMotion ? undefined : 'active-customer-bar'}
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-glow hidden md:block"
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

            <div className="my-2 hidden h-px bg-border/60 md:block" aria-hidden />

            {/* Back to Shopping Button */}
            <motion.div variants={itemVariants}>
              <NavLink
                to={SHOPPING_LINK.to}
                className={({ isActive }) =>
                  cn(
                    'group relative flex shrink-0 items-center gap-3 rounded-xl border border-dashed border-border/80 px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary outline-none',
                    isActive && 'bg-primary/15 text-primary border-solid border-primary/30',
                  )
                }
              >
                <span className="relative z-10 flex items-center justify-center">
                  <SHOPPING_LINK.icon
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 text-muted-foreground group-hover:text-primary"
                    aria-hidden
                  />
                </span>
                <span className="relative z-10">{SHOPPING_LINK.label}</span>
              </NavLink>
            </motion.div>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
