import { Link } from 'react-router-dom'
import {
  Award,
  HeartHandshake,
  Lightbulb,
  Rocket,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  CheckCircle2,
  Cpu,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/common/section-heading'
import {
  MotionReveal,
  StaggerContainer,
  StaggerItem,
  MagneticHover,
} from '@/components/common/motion'

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Quality first',
    text: 'We hand-pick every product for durability, value and design.',
    gradient: 'from-amber-500/15 via-orange-500/10 to-transparent',
    iconColor: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },
  {
    icon: HeartHandshake,
    title: 'Customer obsessed',
    text: 'Fast support, easy returns and honest pricing — always.',
    gradient: 'from-rose-500/15 via-pink-500/10 to-transparent',
    iconColor: 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
    borderHover: 'hover:border-rose-500/40',
  },
  {
    icon: Rocket,
    title: 'Fast delivery',
    text: 'Reliable shipping partners get orders to your door quickly.',
    gradient: 'from-blue-500/15 via-cyan-500/10 to-transparent',
    iconColor: 'bg-blue-500/15 text-blue-500 dark:text-blue-400',
    borderHover: 'hover:border-blue-500/40',
  },
  {
    icon: Award,
    title: 'Better every day',
    text: 'We measure ourselves by your satisfaction, not just sales.',
    gradient: 'from-emerald-500/15 via-teal-500/10 to-transparent',
    iconColor: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
]

const FOCUS_CATEGORIES = [
  {
    icon: Cpu,
    name: 'Electronics',
    desc: 'Smart devices, laptops, audio & accessories engineered for modern life.',
    to: '/products?category=electronics',
  },
  {
    icon: Shirt,
    name: 'Fashion & Apparel',
    desc: 'Versatile, high-quality essentials crafted for comfort and longevity.',
    to: '/products?category=clothing',
  },
  {
    icon: HomeIcon,
    name: 'Home & Kitchen',
    desc: 'Thoughtfully designed kitchenware, decor and daily living essentials.',
    to: '/products?category=home-kitchen',
  },
  {
    icon: Dumbbell,
    name: 'Sports & Active',
    desc: 'Performance gear and activewear built to keep pace with your goals.',
    to: '/products?category=sports',
  },
]

const COMMITMENTS = [
  'Zero hidden fees — transparent pricing from cart to checkout',
  'Carefully verified products focused on lasting durability',
  '30-day hassle-free returns with streamlined processing',
  'Real, responsive human support ready to assist you',
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-primary/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[600px] -right-40 h-80 w-80 rounded-full bg-accent-glow/15 blur-[120px]"
      />

      <div className="container relative z-10 py-12 lg:py-20 space-y-20 lg:space-y-28">
        {/* ================================================================
           1. HERO & BRAND STORY SECTION
        ================================================================ */}
        <section aria-labelledby="about-hero-title">
          <MotionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Our Story & Mission</span>
              </div>
              <h1
                id="about-hero-title"
                className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance"
              >
                Shopping designed around <span className="text-primary">you</span>.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed sm:text-xl text-balance">
                sdCart is a modern online store built around one simple idea: shopping should be
                straightforward, completely transparent, and genuinely enjoyable.
              </p>
            </div>
          </MotionReveal>

          {/* Narrative & Story Card Grid */}
          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center">
            <MotionReveal direction="left" className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border bg-card/80 p-8 sm:p-10 card-glow backdrop-blur-sm relative overflow-hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
                />
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Why we started sdCart
                </h2>
                <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We started sdCart to fix the parts of e-commerce that frustrate everyone: unexpected hidden
                    fees, unreliable stock levels, and checkouts that feel like obstacle courses.
                  </p>
                  <p>
                    Our catalog is purposefully curated around electronics, fashion, home essentials, and
                    sports gear — departments where authentic craftsmanship and lasting quality truly matter.
                  </p>
                  <p>
                    Every single order is fulfilled with precision and care, every return is hassle-free, and
                    our customer support is powered by a real group of dedicated people who respond promptly.
                    When you shop with sdCart, you know exactly what you get and what it costs — no surprises.
                  </p>
                </div>
              </div>
            </MotionReveal>

            <MotionReveal direction="right" className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10 shadow-lift card-glow">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">The sdCart Promise</h3>
                    <p className="text-xs text-muted-foreground">What you can count on every time</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5">
                  {COMMITMENTS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                      <span className="text-sm font-medium text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <PackageCheck className="h-4 w-4 text-primary" />
                    <span>Free shipping on orders over ₹50</span>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary gap-1">
                    <Link to="/products">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
           2. CORE VALUES SECTION
        ================================================================ */}
        <section aria-labelledby="values-heading">
          <MotionReveal>
            <SectionHeading
              align="center"
              eyebrow="What guides us"
              title="Our Core Values"
              subtitle="The guiding principles that shape our customer experience and product standards."
            />
          </MotionReveal>

          <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text, gradient, iconColor, borderHover }) => (
              <StaggerItem key={title} className="h-full">
                <div
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-card p-7 card-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${borderHover}`}
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ================================================================
           3. CURATED DEPARTMENTS SECTION
        ================================================================ */}
        <section aria-labelledby="departments-heading">
          <MotionReveal>
            <SectionHeading
              align="center"
              eyebrow="Curated with purpose"
              title="Built for what matters"
              subtitle="We focus on core categories where design, functionality, and longevity make a real difference."
            />
          </MotionReveal>

          <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FOCUS_CATEGORIES.map(({ icon: Icon, name, desc, to }) => (
              <StaggerItem key={name} className="h-full">
                <Link
                  to={to}
                  className="group relative flex h-full flex-col justify-between rounded-2xl border bg-card/60 p-6 backdrop-blur-sm card-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lift"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Shop {name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ================================================================
           4. CALL TO ACTION BANNER
        ================================================================ */}
        <section aria-labelledby="about-cta-heading">
          <MotionReveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#4338ca] to-[#1e1b4b] px-6 py-14 text-center sm:px-12 lg:py-20 shadow-2xl">
              {/* Decorative elements */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-accent-glow/20 blur-3xl" />
                <Sparkles className="absolute left-[10%] top-10 h-6 w-6 animate-float text-white/30" />
                <Sparkles className="absolute bottom-10 right-[12%] h-7 w-7 animate-float-slow text-white/20" />
              </div>

              <div className="relative mx-auto max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                  Join Thousands of Smart Shoppers
                </p>
                <h2
                  id="about-cta-heading"
                  className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
                >
                  Ready to discover quality you can trust?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-white/80 leading-relaxed">
                  Explore thousands of hand-picked products backed by free shipping over ₹50, secure checkout,
                  and 30-day effortless returns.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <MagneticHover strength={0.25}>
                    <Button
                      asChild
                      size="lg"
                      className="h-12 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-pop transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-glow active:scale-[0.98]"
                    >
                      <Link to="/products">
                        Start shopping
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </MagneticHover>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/categories">Browse categories</Link>
                  </Button>
                </div>
              </div>
            </div>
          </MotionReveal>
        </section>
      </div>
    </div>
  )
}
