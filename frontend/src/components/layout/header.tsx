import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User as UserIcon,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Logo } from '@/components/common/logo'
import { isAdminUser, useAuthStore } from '@/features/auth/auth-store'
import { useCartCount } from '@/features/cart/hooks'
import { authService } from '@/services/auth'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/format'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Header() {
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const cartCount = useCartCount()

  const user = useAuthStore((s) => s.user)
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  function submitSearch(e: FormEvent) {
    e.preventDefault()

    const q = query.trim()

    if (!q) return

    setSearchOpen(false)
    setMobileOpen(false)

    navigate(`/products?q=${encodeURIComponent(q)}`)

    setQuery('')
  }

  async function handleLogout() {
    await authService.logout()

    logout()

    toast.success('You have been signed out')

    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ============================================================
          PREMIUM ANNOUNCEMENT BAR
      ============================================================ */}
      <div className="announcement-bar relative overflow-hidden text-white">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-1/2 h-24 w-48 -translate-y-1/2 rounded-full bg-blue-500/25 blur-3xl animate-pulse" />

          <div
            className="absolute -right-24 top-1/2 h-24 w-48 -translate-y-1/2 rounded-full bg-violet-500/25 blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          <div className="announcement-light absolute inset-y-0 left-0 w-1/3" />
        </div>

        {/* Moving announcement */}
        <div className="relative flex h-10 items-center overflow-hidden">
          <div className="announcement-marquee flex shrink-0 items-center whitespace-nowrap">
            {/* Announcement 1 */}
            <div className="announcement-item flex items-center gap-3 px-10 text-[11px] font-medium tracking-wide sm:text-xs">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400/20" />

                <Sparkles className="relative h-3.5 w-3.5 text-yellow-300 drop-shadow-[0_0_7px_rgba(253,224,71,0.8)]" />
              </span>

              <span className="text-white/90">
                Free shipping on orders over{' '}
                <span className="announcement-gradient-text font-bold">
                  $50
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="text-white/75">
                30-day{' '}
                <span className="font-semibold text-white">
                  easy returns
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="font-semibold text-cyan-300">
                Shop smarter. Live better.
              </span>

              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 drop-shadow-[0_0_7px_rgba(103,232,249,0.7)]" />
            </div>

            {/* Announcement 2 */}
            <div className="announcement-item flex items-center gap-3 px-10 text-[11px] font-medium tracking-wide sm:text-xs">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400/20" />

                <Sparkles className="relative h-3.5 w-3.5 text-yellow-300 drop-shadow-[0_0_7px_rgba(253,224,71,0.8)]" />
              </span>

              <span className="text-white/90">
                Free shipping on orders over{' '}
                <span className="announcement-gradient-text font-bold">
                  $50
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="text-white/75">
                30-day{' '}
                <span className="font-semibold text-white">
                  easy returns
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="font-semibold text-cyan-300">
                Shop smarter. Live better.
              </span>

              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 drop-shadow-[0_0_7px_rgba(103,232,249,0.7)]" />
            </div>

            {/* Announcement 3 */}
            <div className="announcement-item flex items-center gap-3 px-10 text-[11px] font-medium tracking-wide sm:text-xs">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400/20" />

                <Sparkles className="relative h-3.5 w-3.5 text-yellow-300 drop-shadow-[0_0_7px_rgba(253,224,71,0.8)]" />
              </span>

              <span className="text-white/90">
                Free shipping on orders over{' '}
                <span className="announcement-gradient-text font-bold">
                  $50
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="text-white/75">
                30-day{' '}
                <span className="font-semibold text-white">
                  easy returns
                </span>
              </span>

              <span className="announcement-separator">✦</span>

              <span className="font-semibold text-cyan-300">
                Shop smarter. Live better.
              </span>

              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 drop-shadow-[0_0_7px_rgba(103,232,249,0.7)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PREMIUM 3D MAIN HEADER
      ============================================================ */}
      <div className="site-header relative border-b border-slate-200/70 bg-white/80 shadow-[0_8px_40px_rgba(15,23,42,0.07)] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/80">
        {/* ==========================================================
            AMBIENT LIGHTING
        ========================================================== */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Left blue glow */}
          <div className="nav-ambient-blue absolute -left-24 top-1/2 h-32 w-72 -translate-y-1/2 rounded-full bg-blue-500/[0.07] blur-3xl" />

          {/* Right violet glow */}
          <div className="nav-ambient-violet absolute -right-24 top-1/2 h-32 w-72 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-3xl" />

          {/* Top reflection */}
          <div className="nav-reflection absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/10" />

          {/* Moving glass light */}
          <div className="nav-light-sweep absolute inset-y-0 left-0 w-1/4" />
        </div>

        {/* ==========================================================
            HEADER CONTENT
        ========================================================== */}
        <div className="relative container flex min-h-[74px] items-center gap-3 py-2 sm:gap-5">
          {/* ========================================================
              MOBILE MENU
          ======================================================== */}
          <button
            type="button"
            className={cn(
              'nav-action group relative inline-flex h-10 w-10 shrink-0',
              'items-center justify-center overflow-hidden',
              'rounded-xl border border-slate-200/80',
              'bg-white/70 shadow-sm backdrop-blur-xl',
              'transition-all duration-300',
              'hover:-translate-y-0.5',
              'hover:border-blue-200',
              'hover:bg-blue-50/80',
              'hover:shadow-[0_10px_25px_rgba(37,99,235,0.14)]',
              'active:translate-y-0 active:scale-95',
              'lg:hidden',
              'dark:border-slate-800',
              'dark:bg-slate-900/70',
              'dark:hover:border-blue-800',
              'dark:hover:bg-blue-950/30',
            )}
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <span className="nav-button-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {mobileOpen ? (
              <X className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <Menu className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>

          {/* ========================================================
              3D LOGO
          ======================================================== */}
          <div
            className="nav-logo group relative shrink-0"
            style={{ perspective: '1200px' }}
          >
            {/* Logo glow */}
            <div className="pointer-events-none absolute -inset-5 rounded-3xl bg-blue-500/10 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

            {/* Logo 3D body */}
            <div
              className={cn(
                'relative rounded-2xl px-1 py-1',
                '[transform-style:preserve-3d]',
                'transition-all duration-500 ease-out',
                'group-hover:[transform:rotateX(5deg)_rotateY(-8deg)_translateY(-2px)]',
                'group-hover:drop-shadow-[0_15px_20px_rgba(37,99,235,0.16)]',
              )}
            >
              {/* Logo highlight */}
              <span className="pointer-events-none absolute left-2 right-2 top-1 h-px rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-white/20" />

              <Logo />
            </div>
          </div>

          {/* ========================================================
              DESKTOP NAVIGATION
          ======================================================== */}
          <nav
            aria-label="Main"
            className="hidden items-center lg:flex"
          >
            <div
              className={cn(
                'nav-navigation relative flex items-center gap-1',
                'rounded-2xl border border-slate-200/70',
                'bg-white/55 p-1',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_25px_rgba(15,23,42,0.05)]',
                'backdrop-blur-xl',
                'dark:border-slate-800/80',
                'dark:bg-slate-900/55',
                'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_25px_rgba(0,0,0,0.2)]',
              )}
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'nav-link group relative',
                      'flex items-center justify-center',
                      'rounded-xl px-4 py-2.5',
                      'text-sm font-medium',
                      'transition-all duration-300 ease-out',
                      'focus-visible:outline-none',
                      'focus-visible:ring-2',
                      'focus-visible:ring-blue-500/50',
                      'focus-visible:ring-offset-2',
                      'dark:focus-visible:ring-offset-slate-950',

                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active / hover surface */}
                      <span
                        className={cn(
                          'pointer-events-none absolute inset-0 rounded-xl',
                          'transition-all duration-300',
                          isActive
                            ? ['nav-active-surface', 'opacity-100']
                            : [
                                'bg-slate-100/70',
                                'opacity-0',
                                'group-hover:opacity-100',
                                'dark:bg-slate-800/70',
                              ],
                        )}
                      />

                      {/* Active top reflection */}
                      {isActive && (
                        <span className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
                      )}

                      {/* Nav text */}
                      <span
                        className={cn(
                          'relative z-10 transition-transform duration-300',
                          'group-hover:-translate-y-[1px]',
                          isActive && 'font-semibold',
                        )}
                      >
                        {link.label}
                      </span>

                      {/* Active glow dot */}
                      {isActive && (
                        <span
                          className={cn(
                            'absolute bottom-0 left-1/2',
                            'h-1 w-1',
                            '-translate-x-1/2 translate-y-1/2',
                            'rounded-full',
                            'bg-blue-500',
                            'shadow-[0_0_5px_rgba(59,130,246,0.8),0_0_12px_rgba(59,130,246,0.5)]',
                          )}
                        />
                      )}

                      {/* Hover light */}
                      <span className="nav-link-light pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* ========================================================
              SPACER
          ======================================================== */}
          <div className="ml-auto" />

          {/* ========================================================
              RIGHT ACTIONS
          ======================================================== */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* ======================================================
                SEARCH
            ====================================================== */}
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className={cn(
                  'flex items-center gap-1.5',
                  'animate-in slide-in-from-right-2 fade-in',
                  'duration-300',
                )}
                role="search"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className={cn(
                      'h-10 w-40 rounded-xl border-slate-200',
                      'bg-slate-50/80 pl-9 pr-3',
                      'shadow-inner transition-all duration-300',
                      'focus:w-48 focus:border-blue-400',
                      'focus:ring-4 focus:ring-blue-500/10',
                      'sm:w-56 sm:focus:w-64',
                      'dark:border-slate-800 dark:bg-slate-900',
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    'h-10 w-10 rounded-xl',
                    'shadow-lg shadow-blue-500/20',
                    'transition-all duration-300',
                    'hover:-translate-y-0.5 hover:shadow-blue-500/30',
                    'active:scale-95',
                  )}
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="h-10 w-10 rounded-xl transition-all duration-300 hover:rotate-90 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  'group h-10 w-10 rounded-xl',
                  'border border-transparent',
                  'transition-all duration-300',
                  'hover:-translate-y-0.5 hover:border-slate-200',
                  'hover:bg-white hover:shadow-lg',
                  'dark:hover:border-slate-800 dark:hover:bg-slate-900',
                )}
                aria-label="Open search"
              >
                <Search className="h-[19px] w-[19px] transition-transform duration-300 group-hover:scale-110" />
              </Button>
            )}

            {/* ======================================================
                WISHLIST
            ====================================================== */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                'group h-10 w-10 rounded-xl',
                'border border-transparent',
                'transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-rose-100',
                'hover:bg-rose-50 hover:shadow-[0_8px_20px_rgba(244,63,94,0.12)]',
                'dark:hover:border-rose-900/50 dark:hover:bg-rose-950/20',
              )}
              aria-label="Wishlist"
            >
              <Link to="/account/wishlist">
                <Heart className="h-[19px] w-[19px] transition-all duration-300 group-hover:scale-110 group-hover:fill-rose-500 group-hover:text-rose-500" />
              </Link>
            </Button>

            {/* ======================================================
                CART
            ====================================================== */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                'group relative h-10 w-10 rounded-xl',
                'border border-transparent',
                'transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-blue-100',
                'hover:bg-blue-50 hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]',
                'dark:hover:border-blue-900/50 dark:hover:bg-blue-950/20',
              )}
              aria-label={`Cart, ${cartCount} items`}
            >
              <Link to="/cart">
                <ShoppingCart className="h-[19px] w-[19px] transition-transform duration-300 group-hover:scale-110" />

                {cartCount > 0 && (
                  <span
                    className={cn(
                      'absolute -right-1 -top-1',
                      'flex h-[18px] min-w-[18px]',
                      'items-center justify-center',
                      'rounded-full border-2 border-white',
                      'bg-gradient-to-br from-blue-500 to-indigo-600',
                      'px-1 text-[9px] font-bold text-white',
                      'shadow-lg shadow-blue-500/30',
                      'animate-in zoom-in duration-300',
                      'dark:border-slate-950',
                    )}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* ======================================================
                AUTHENTICATED USER
            ====================================================== */}
            {isAuthed && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group relative ml-1 h-10 w-10 rounded-full"
                    aria-label="Account menu"
                  >
                    {/* Avatar glow */}
                    <span className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                    {/* 3D avatar */}
                    <span
                      className={cn(
                        'relative flex h-9 w-9 items-center justify-center',
                        'rounded-full',
                        'border border-white/80',
                        'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600',
                        'text-xs font-bold text-white',
                        'shadow-[0_5px_15px_rgba(37,99,235,0.3)]',
                        'transition-all duration-300',
                        'group-hover:-translate-y-0.5',
                        'group-hover:rotate-3',
                        'group-hover:shadow-[0_10px_25px_rgba(37,99,235,0.4)]',
                        'dark:border-slate-800',
                      )}
                    >
                      {getInitials(user.firstName, user.lastName)}

                      {/* Highlight */}
                      <span className="pointer-events-none absolute left-1 top-1 h-2 w-2 rounded-full bg-white/50 blur-[1px]" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className={cn(
                    'w-64 rounded-2xl border-slate-200/80 p-2',
                    'bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.15)]',
                    'backdrop-blur-xl',
                    'animate-in zoom-in-95 slide-in-from-top-2',
                    'dark:border-slate-800 dark:bg-slate-950/95',
                  )}
                >
                  {/* User information */}
                  <DropdownMenuLabel className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center',
                          'rounded-xl',
                          'bg-gradient-to-br from-blue-500 to-indigo-600',
                          'text-xs font-bold text-white',
                          'shadow-lg shadow-blue-500/20',
                        )}
                      >
                        {getInitials(user.firstName, user.lastName)}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {`${user.firstName} ${user.lastName}`}
                        </div>

                        <div className="truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Profile */}
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors focus:bg-blue-50 dark:focus:bg-blue-950/30"
                  >
                    <Link to="/account/profile">
                      <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {/* Orders */}
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors focus:bg-blue-50 dark:focus:bg-blue-950/30"
                  >
                    <Link to="/account/orders">
                      <Package className="mr-2 h-4 w-4 text-indigo-500" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>

                  {/* Wishlist */}
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors focus:bg-rose-50 dark:focus:bg-rose-950/30"
                  >
                    <Link to="/account/wishlist">
                      <Heart className="mr-2 h-4 w-4 text-rose-500" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin */}
                  {isAdminUser(user) && (
                    <>
                      <DropdownMenuSeparator className="my-2" />

                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-xl bg-blue-50/70 px-3 py-2.5 font-medium text-blue-700 transition-colors focus:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:focus:bg-blue-950/50"
                      >
                        <Link to="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="my-2" />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700 dark:text-rose-400 dark:focus:bg-rose-950/30"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* ====================================================
                 GUEST ACTIONS
              ==================================================== */
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Link to="/login">Sign in</Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className={cn(
                    'rounded-xl px-4',
                    'bg-gradient-to-r from-blue-600 to-indigo-600',
                    'shadow-lg shadow-blue-500/20',
                    'transition-all duration-300',
                    'hover:-translate-y-0.5',
                    'hover:shadow-xl hover:shadow-blue-500/30',
                    'active:scale-95',
                  )}
                >
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MOBILE MENU
      ============================================================ */}
      {mobileOpen && (
        <div className="border-b border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
          <nav
            aria-label="Mobile"
            className="container flex flex-col gap-1 py-4"
          >
            {NAV_LINKS.map((link, index) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between',
                    'rounded-xl px-4 py-3',
                    'text-sm font-medium',
                    'transition-all duration-300',
                    'animate-in slide-in-from-top-2 fade-in',
                    'hover:translate-x-1',
                    'hover:bg-slate-100',
                    'dark:hover:bg-slate-900',
                    isActive &&
                      'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/30 dark:text-blue-300',
                  )
                }
                style={{
                  animationDelay: `${index * 40}ms`,
                }}
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>

                    <ArrowUpRight
                      className={cn(
                        'h-4 w-4 opacity-0 transition-all duration-300',
                        'group-hover:translate-x-0.5',
                        'group-hover:-translate-y-0.5',
                        'group-hover:opacity-100',
                        isActive && 'opacity-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {!isAuthed && (
              <div className="mt-3 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-11 flex-1 rounded-xl"
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="h-11 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
                >
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                  >
                    Create account
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}