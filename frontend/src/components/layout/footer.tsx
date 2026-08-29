import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowUp,
  ChevronDown,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
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

const VALUE_PROPS = [
  {
    icon: Truck,
    title: 'Free Fast Shipping',
    desc: 'On all orders over ₹50',
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Checkout',
    desc: '256-bit SSL Encryption',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  },
  {
    icon: RotateCcw,
    title: '30-Day Easy Returns',
    desc: 'Hassle-free money back',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Instant expert assistance',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
  },
]

const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61593368008739' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/sdcartonlineshopping?igsi=MTdwOWFmaWF2M3gxNQ==' },
  { icon: Youtube, label: 'YouTube', href: '#' },
]

export function Footer() {
  const prefersReducedMotion = useReducedMotion()
  const [emailInput, setEmailInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Shop: false,
    Account: false,
    Company: false,
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      import('sonner').then(({ toast }) => {
        toast.success('Thanks! Newsletter coming soon.')
      })
      setIsSubmitting(false)
      setEmailInput('')
    }, 400)
  }

  return (
    <motion.footer
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-t border-slate-800/80 bg-[#0f1117] pt-12 pb-8 text-slate-100 shadow-2xl"
    >
      {/* Top Border Glow Sheen & Ambient Background Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-64 w-[400px] rounded-full bg-indigo-500/10 blur-[120px]"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================================================================
           1. TOP VALUE PROPOSITION BAR (3D Dark Glass Cards)
        ================================================================ */}
        <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.015 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-md backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-primary/5"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
                />
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ================================================================
           2. MAIN FOOTER CONTENT GRID
        ================================================================ */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 pb-12">
          {/* BRAND & CONTACT COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              {/* Premium Logo Presentation */}
              <div className="relative inline-block group">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-xl bg-gradient-to-r from-primary/40 via-indigo-500/20 to-primary/30 blur-md opacity-30 group-hover:opacity-75 transition-opacity duration-500"
                />
                <Logo className="relative flex items-center gap-3 font-bold text-lg [&_img]:h-11 sm:[&_img]:h-14 [&_img]:w-auto [&_img]:object-contain [&_img]:rounded-xl drop-shadow-[0_6px_20px_rgba(99,102,241,0.35)] transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                sdCart is your premier destination for next-generation tech, modern fashion, and home essentials. Elevate your shopping experience with smart choices.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-3 group">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span>100 Market Street, San Francisco, CA</span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a href="tel:+918555984667" className="transition-colors hover:text-primary">
                  +91 (855) 598-4667
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a href="mailto:sdcartbigmart@gmail.com" className="transition-colors hover:text-primary break-all">
                  sdcartbigmart@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span>Mon - Sun: 8:00 AM - 10:00 PM PST</span>
              </li>
            </ul>

            {/* 3D Animated Social Icons */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Connect With Us</p>
              <div className="flex flex-wrap gap-2.5">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => {
                  const isExternal = href && href !== '#'
                  return (
                    <MagneticHover key={label} strength={0.3}>
                      <a
                        href={href}
                        {...(isExternal
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : { onClick: (e: React.MouseEvent) => e.preventDefault() })}
                        aria-label={label}
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden />
                      </a>
                    </MagneticHover>
                  )
                })}
              </div>
            </div>
          </div>

          {/* DESKTOP & MOBILE NAVIGATION COLUMNS (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            <AccordionColumn
              title="Shop"
              links={SHOP_LINKS}
              isOpen={openSections.Shop}
              onToggle={() => toggleSection('Shop')}
            />
            <AccordionColumn
              title="Account"
              links={ACCOUNT_LINKS}
              isOpen={openSections.Account}
              onToggle={() => toggleSection('Account')}
            />
            <AccordionColumn
              title="Company"
              links={COMPANY_LINKS}
              isOpen={openSections.Company}
              onToggle={() => toggleSection('Company')}
            />
          </div>

          {/* NEWSLETTER CARD COLUMN (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-primary/10 p-6 shadow-xl backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl"
              />
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Stay In The Loop</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">Subscribe to Deals</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Get exclusive drops, secret discount codes, and weekly tech & fashion highlights delivered straight to your inbox.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubscribe()
                }}
                className="mt-4 space-y-2.5"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address..."
                    aria-label="Email for newsletter"
                    className="h-10 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-9 pr-3 text-xs text-slate-100 backdrop-blur-md transition-all duration-300 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <MagneticHover strength={0.2} className="w-full">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Subscribing...
                      </span>
                    ) : (
                      <>
                        <span>Subscribe Now</span>
                        <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                      </>
                    )}
                  </button>
                </MagneticHover>
                <p className="text-[11px] text-slate-400/80 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ================================================================
           3. BOTTOM BAR (Sole Content: Centered Copyright + Back to Top)
        ================================================================ */}
        <div className="relative pt-6 border-t border-slate-800/80 flex items-center justify-center min-h-[52px]">
          <p className="text-center text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} <span className="font-semibold text-slate-200">sdCart</span>. All rights reserved. Designed for smart shoppers.
          </p>

          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <MagneticHover strength={0.3}>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:-translate-y-0.5"
              >
                <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </button>
            </MagneticHover>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

/* ================================================================
   SUB-COMPONENT: Accordion Column for Navigation (Responsive)
================================================================ */
function AccordionColumn({
  title,
  links,
  isOpen,
  onToggle,
}: {
  title: string
  links: Array<{ label: string; to: string }>
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <nav aria-label={title} className="border-b border-slate-800/60 sm:border-none pb-4 sm:pb-0">
      {/* Mobile Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-slate-200 sm:cursor-default sm:py-0 sm:mb-4"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 sm:hidden ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Column Links list */}
      <div className={`space-y-2.5 ${isOpen ? 'block pt-2' : 'hidden'} sm:block`}>
        {links.map((link) => (
          <div key={link.to}>
            <Link
              to={link.to}
              className="group relative inline-flex items-center gap-1.5 text-xs text-slate-400 transition-all duration-300 hover:text-primary hover:translate-x-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span>{link.label}</span>
            </Link>
          </div>
        ))}
      </div>
    </nav>
  )
}
