import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { MagneticHover } from '@/components/common/motion'

const SHOP_LINKS = [
  { label: 'All Products', to: '/products' },
  { label: 'Electronics', to: '/products?category=electronics' },
  { label: 'Clothing', to: '/products?category=clothing' },
  { label: 'Home & Kitchen', to: '/products?category=home-kitchen' },
  { label: 'Sports', to: '/products?category=sports' },
]

const ACCOUNT_LINKS = [
  { label: 'My Account', to: '/account/profile' },
  { label: 'My Orders', to: '/account/orders' },
  { label: 'Wishlist', to: '/account/wishlist' },
  { label: 'Cart', to: '/cart' },
]

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
]

export function Footer() {
  return (
    <footer className="relative border-t bg-muted/40">
      {/* Gradient mesh top blend */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.02] to-transparent"
      />

      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            A modern online store for electronics, fashion, home goods and more. Shop smart, live better.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden /> 100 Market Street, San Francisco, CA
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden /> +1 (555) 010-2020
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden /> support@sdcart.com
            </li>
          </ul>
          <div className="flex gap-2 pt-1">
            {[
              { icon: Facebook, label: 'Facebook' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Twitter, label: 'Twitter' },
            ].map(({ icon: Icon, label }) => (
              <MagneticHover key={label} strength={0.35}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-glow hover:scale-105"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              </MagneticHover>
            ))}
          </div>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        <FooterColumn title="Company" links={COMPANY_LINKS} />
      </div>

      {/* Newsletter / bottom bar */}
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} sdCart. All rights reserved.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Secure payments · Free returns · Customer support 24/7
            </p>
          </div>

          {/* Newsletter CTA — UI only, no backend endpoint */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email for newsletter"
                className="h-9 w-48 rounded-lg border bg-background/80 px-3 text-xs backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:shadow-glow sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                // No backend endpoint — stub for future use
                import('sonner').then(({ toast }) => {
                  toast.success('Thanks! Newsletter coming soon.')
                })
              }}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; to: string }> }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
