import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MagneticHover } from '@/components/common/motion'
import { ProductImage } from '@/components/common/product-image'
import { RatingStars } from '@/components/common/rating-stars'
import { formatPrice } from '@/utils/format'
import type { PageResponse } from '@/types/api'
import type { ProductResponse } from '@/types'

export interface HeroSlide {
  id: string
  eyebrow: string
  titleLine1: string
  titleLine2: string
  description: string
  primaryCtaText: string
  primaryCtaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  badgeText: string
  product?: ProductResponse
}

interface HeroSectionProps {
  query?: {
    data?: PageResponse<ProductResponse>
    isPending?: boolean
  }
  customSlides?: HeroSlide[]
  autoRotateInterval?: number
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'New Season · Fresh Arrivals',
    titleLine1: 'Shop smart.',
    titleLine2: 'Live better.',
    description:
      'Explore premium electronics, modern fashion, home essentials and everyday favorites — all in one seamless shopping experience.',
    primaryCtaText: 'Shop now',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Explore categories',
    secondaryCtaLink: '/categories',
    badgeText: 'Featured collection',
  },
  {
    id: 'slide-2',
    eyebrow: 'Trending Now · Top Rated',
    titleLine1: 'Next-gen tech',
    titleLine2: 'Unmatched style.',
    description:
      'Discover cutting-edge gadgets and curated lifestyle items engineered for performance and designed to impress.',
    primaryCtaText: 'Browse electronics',
    primaryCtaLink: '/products?category=electronics',
    secondaryCtaText: 'View deals',
    secondaryCtaLink: '/products?featured=true',
    badgeText: 'Trending picks',
  },
  {
    id: 'slide-3',
    eyebrow: 'Exclusive Deals · Limited Time',
    titleLine1: 'Elevate your',
    titleLine2: 'Everyday lifestyle.',
    description:
      'Upgrade your home and wardrobe with hand-picked quality products backed by fast shipping and 30-day hassle-free returns.',
    primaryCtaText: 'Shop fashion',
    primaryCtaLink: '/products?category=clothing',
    secondaryCtaText: 'Home & Kitchen',
    secondaryCtaLink: '/products?category=home-kitchen',
    badgeText: 'Special offer',
  },
]

export function HeroSection({
  query,
  customSlides,
  autoRotateInterval = 5000,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  // Construct slides list: custom -> API products -> fallback
  const apiProducts = query?.data?.content?.filter((p) => p.images.length > 0) ?? []

  const slides: HeroSlide[] = customSlides?.length
    ? customSlides
    : apiProducts.length > 0
    ? apiProducts.slice(0, 4).map((product, idx) => ({
        id: product.publicId ?? `product-${idx}`,
        eyebrow:
          idx === 0
            ? 'Featured Highlight · New Arrival'
            : idx === 1
            ? 'Top Rated · Customer Choice'
            : idx === 2
            ? 'Trending Now · Limited Supply'
            : 'Editor Pick · Special Value',
        titleLine1: product.name.split(' ')[0] ?? 'Featured',
        titleLine2: product.name.split(' ').slice(1, 4).join(' ') || 'Selection',
        description:
          product.shortDescription ||
          product.description ||
          'Hand-picked quality products delivered straight to your door with fast, reliable shipping.',
        primaryCtaText: 'Shop product',
        primaryCtaLink: `/products/${product.publicId}`,
        secondaryCtaText: 'View all products',
        secondaryCtaLink: '/products',
        badgeText: 'Featured product',
        product,
      }))
    : DEFAULT_SLIDES

  const totalSlides = slides.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<number>(1) // 1 = next, -1 = prev
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isDocVisible, setIsDocVisible] = useState(true)

  const activeSlide = slides[currentIndex] ?? slides[0]

  // Track Page Visibility API (Pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Navigation handlers with debounce guard
  const goToNext = useCallback(() => {
    if (isAnimating || totalSlides <= 1) return
    setIsAnimating(true)
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [isAnimating, totalSlides])

  const goToPrev = useCallback(() => {
    if (isAnimating || totalSlides <= 1) return
    setIsAnimating(true)
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [isAnimating, totalSlides])

  const goToIndex = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex || totalSlides <= 1) return
      setIsAnimating(true)
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    },
    [currentIndex, isAnimating, totalSlides],
  )

  // Auto-rotation timer logic (5 seconds)
  useEffect(() => {
    if (
      totalSlides <= 1 ||
      !isDocVisible ||
      prefersReducedMotion
    ) {
      return
    }

    const timer = setInterval(() => {
      goToNext()
    }, autoRotateInterval)

    return () => clearInterval(timer)
  }, [
    autoRotateInterval,
    goToNext,
    isDocVisible,
    prefersReducedMotion,
    totalSlides,
  ])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (diff > 50) {
      goToNext() // Swipe left -> Next slide
    } else if (diff < -50) {
      goToPrev() // Swipe right -> Prev slide
    }
    setTouchStart(null)
  }

  // Product calculation for active slide
  const heroProduct = activeSlide.product
  const discount = heroProduct?.compareAtPrice
    ? Math.round(
        (1 - Number(heroProduct.price) / Number(heroProduct.compareAtPrice)) * 100,
      )
    : null

  const showDiscount =
    discount !== null && Number.isFinite(discount) && discount > 0

  return (
    <section
      className="relative overflow-hidden border-b bg-background select-none outline-none"
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      aria-label="Featured Products Hero Carousel"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================
          INTERACTIVE AURORA BACKGROUND
      ============================================================ */}
      <AuroraBackground />

      {/* ============================================================
          MAIN CAROUSEL CONTAINER
      ============================================================ */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 xl:gap-14 min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
          {/* ==========================================================
              LEFT CONTENT (STAGGERED ANIMATION)
          ========================================================== */}
          <div className="max-w-xl">
            <AnimatePresence
              mode="wait"
              custom={direction}
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={activeSlide.id}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? 25 : -25,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? -25 : 25,
                }}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="space-y-3"
              >
                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                    <Sparkles className="h-3 w-3" aria-hidden />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    {activeSlide.eyebrow}
                  </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  id="hero-heading"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="
                    font-display
                    text-2xl
                    font-extrabold
                    leading-[1.02]
                    tracking-[-0.035em]
                    text-foreground
                    sm:text-4xl
                    lg:text-[2.65rem]
                    xl:text-[3.1rem]
                  "
                >
                  {activeSlide.titleLine1}{' '}
                  <span className="block bg-gradient-to-r from-primary via-[hsl(var(--accent-glow))] to-primary bg-clip-text text-transparent">
                    {activeSlide.titleLine2}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                  className="
                    max-w-md
                    text-xs
                    leading-relaxed
                    text-muted-foreground
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  {activeSlide.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.16 }}
                  className="pt-1 flex flex-wrap items-center gap-2.5"
                >
                  <MagneticHover strength={0.25}>
                    <Button
                      asChild
                      size="default"
                      className="
                        h-10
                        rounded-xl
                        px-5
                        text-xs
                        sm:text-sm
                        font-semibold
                        shadow-md
                        transition-all
                        duration-300
                        hover:shadow-glow
                        hover:-translate-y-0.5
                      "
                    >
                      <Link to={activeSlide.primaryCtaLink}>
                        {activeSlide.primaryCtaText}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
                      </Link>
                    </Button>
                  </MagneticHover>

                  {activeSlide.secondaryCtaText && (
                    <MagneticHover strength={0.2}>
                      <Button
                        asChild
                        variant="outline"
                        size="default"
                        className="
                          h-10
                          rounded-xl
                          px-5
                          text-xs
                          sm:text-sm
                          font-semibold
                          glass-surface
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                        "
                      >
                        <Link to={activeSlide.secondaryCtaLink ?? '/categories'}>
                          {activeSlide.secondaryCtaText}
                          <ChevronRight className="h-3.5 w-3.5 ml-1" aria-hidden />
                        </Link>
                      </Button>
                    </MagneticHover>
                  )}
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="
                    pt-3
                    grid
                    max-w-lg
                    grid-cols-1
                    gap-2.5
                    border-t
                    border-border/50
                    sm:grid-cols-3
                  "
                >
                  <TrustItem
                    icon={Truck}
                    title="Fast delivery"
                    description="Reliable shipping"
                  />
                  <TrustItem
                    icon={ShieldCheck}
                    title="Secure checkout"
                    description="Protected payments"
                  />
                  <TrustItem
                    icon={CheckCircle2}
                    title="Easy returns"
                    description="Shop with confidence"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ==========================================================
              RIGHT PRODUCT SHOWCASE
          ========================================================== */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-xl"
              >
                {/* Ambient glow behind card */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-[hsl(var(--accent-glow)/0.15)] blur-xl opacity-60"
                />

                {/* Main Product Glass Container */}
                <div className="glass-surface relative overflow-hidden rounded-2xl shadow-xl border border-border/60">
                  {/* Image Container with Ken Burns Effect */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {query?.isPending ? (
                      <div className="skeleton-shimmer h-full w-full" />
                    ) : heroProduct ? (
                      <div className="h-full w-full overflow-hidden">
                        <motion.div
                          animate={prefersReducedMotion ? {} : { scale: [1, 1.03] }}
                          transition={{ duration: 5, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                          className="h-full w-full"
                        >
                          <ProductImage
                            src={
                              heroProduct.images.find((img) => img.primary)?.imageUrl ??
                              heroProduct.images[0]?.imageUrl
                            }
                            alt={heroProduct.name}
                            className="h-full w-full object-cover"
                          />
                        </motion.div>

                        {/* Soft Gradient Overlay for text legibility */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
                        />
                      </div>
                    ) : (
                      <HeroFallback badgeText={activeSlide.badgeText} />
                    )}

                    {/* Featured Product Badge */}
                    <div className="absolute left-3 top-3">
                      <span className="glass-surface inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-md">
                        <Sparkles className="h-3 w-3 text-primary" aria-hidden />
                        {activeSlide.badgeText}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    {showDiscount && (
                      <div className="absolute right-3 top-3">
                        <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-[hsl(var(--accent-warm))] to-[hsl(var(--accent-warm)/0.85)] px-2.5 py-1.5 text-white shadow-md">
                          <span className="text-[8px] font-semibold uppercase tracking-wider">
                            Save
                          </span>
                          <strong className="font-mono text-base font-extrabold leading-none">
                            {discount}%
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details Bar */}
                  <div className="border-t border-border/50 bg-card/60 backdrop-blur-md px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-bold text-foreground">
                          {heroProduct?.name ?? activeSlide.titleLine1 + ' ' + activeSlide.titleLine2}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {heroProduct ? 'Featured item' : 'Curated collection item'}
                        </p>

                        {heroProduct && heroProduct.averageRating > 0 && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <RatingStars value={heroProduct.averageRating} size="sm" />
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {heroProduct.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {heroProduct && (
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-base font-bold tabular-nums text-foreground">
                            {formatPrice(heroProduct.price)}
                          </p>
                          {showDiscount && heroProduct.compareAtPrice && (
                            <p className="font-mono text-[11px] text-muted-foreground line-through">
                              {formatPrice(heroProduct.compareAtPrice)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Floating Rating Badge */}
                {heroProduct && heroProduct.averageRating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                    className="absolute -bottom-2.5 right-3 hidden items-center gap-1.5 rounded-xl glass-surface px-2.5 py-1.5 shadow-lg sm:flex"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning/10">
                      <Star className="h-3 w-3 fill-warning text-warning" aria-hidden />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-foreground leading-tight">
                        {heroProduct.averageRating.toFixed(1)}
                      </p>
                      <p className="text-[8px] text-muted-foreground leading-none">Customer rating</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ============================================================
            CAROUSEL CONTROLS & ANIMATED 5s PROGRESS INDICATORS
        ============================================================ */}
        {totalSlides > 1 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-3.5">
            {/* Progress Dots / Bars */}
            <div className="flex items-center gap-2.5">
              {slides.map((slide, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.titleLine1}`}
                    className="group relative h-2.5 rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    style={{ width: isActive ? '48px' : '12px' }}
                  >
                    {/* Background Pill */}
                    <div className="absolute inset-0 rounded-full bg-muted-foreground/25 transition-colors group-hover:bg-muted-foreground/40" />

                    {/* Animated Fill Bar for active slide (5s duration) */}
                    {isActive && (
                      <motion.div
                        key={`progress-${currentIndex}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: autoRotateInterval / 1000,
                          ease: 'linear',
                        }}
                        className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-glow"
                      />
                    )}
                  </button>
                )
              })}

              {/* Slide Count */}
              <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground">
                0{currentIndex + 1} / 0{totalSlides}
              </span>
            </div>

            {/* Manual Arrows Navigation */}
            <div className="flex items-center gap-2">
              <MagneticHover strength={0.3}>
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous slide"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </MagneticHover>

              <MagneticHover strength={0.3}>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </MagneticHover>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ================================================================
   AURORA BACKGROUND — INTERACTIVE
   CSS aurora blobs + JS-driven pointer-following glow.
================================================================ */

function AuroraBackground() {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)
  const [pointerVisible, setPointerVisible] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || !pointerRef.current) return
      pointerRef.current.style.left = `${e.clientX - rect.left}px`
      pointerRef.current.style.top = `${e.clientY - rect.top}px`
      if (!pointerVisible) setPointerVisible(true)
    },
    [prefersReduced, pointerVisible],
  )

  const handleMouseLeave = useCallback(() => {
    setPointerVisible(false)
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Static/animated aurora blobs */}
      <div className="aurora-bg" />

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Interactive pointer glow */}
      <div
        ref={pointerRef}
        className="aurora-pointer"
        style={{ opacity: pointerVisible ? 1 : 0 }}
      />

      {/* Top gradient fade for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
    </div>
  )
}

/* ================================================================
   TRUST ITEM
================================================================ */

function TrustItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Truck
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3 w-3" aria-hidden />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-foreground leading-tight">{title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground leading-none">{description}</p>
      </div>
    </div>
  )
}

/* ================================================================
   FALLBACK
================================================================ */

function HeroFallback({ badgeText }: { badgeText?: string }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-card/80 to-muted/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" aria-hidden />
      </div>

      <p className="mt-3 font-display text-base font-bold text-foreground">
        {badgeText ?? 'New arrivals, curated weekly'}
      </p>

      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Hand-picked products landing in the store right now.
      </p>
    </div>
  )
}