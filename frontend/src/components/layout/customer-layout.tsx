import { NavLink, Outlet } from 'react-router-dom'
import { Heart, MapPin, Package, ShoppingBag, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'Profile', to: '/account/profile', icon: User },
  { label: 'My Orders', to: '/account/orders', icon: Package },
  { label: 'Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'My Reviews', to: '/account/reviews', icon: Star },
  { label: 'Shopping Cart', to: '/cart', icon: ShoppingBag },
]

export function CustomerLayout() {
  return (
    <div className="container grid gap-8 py-8 md:grid-cols-[220px_1fr]">
      <aside>
        <nav aria-label="Account" className="flex gap-1 overflow-x-auto md:flex-col">
          {LINKS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
