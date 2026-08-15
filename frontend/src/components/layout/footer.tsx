import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import { Logo } from '@/components/common/logo'

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
  { label: 'Wishlist', to: '/wishlist' },
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
    <footer className="border-t bg-muted/40">
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
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        <FooterColumn title="Company" links={COMPANY_LINKS} />
      </div>

      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} sdCart. All rights reserved.</p>
          <p>Secure payments · Free returns · Customer support 24/7</p>
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
            <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
