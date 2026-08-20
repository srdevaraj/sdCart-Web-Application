import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

/* ================================================================
   CONSTANTS & CONFIGURATION
   Production-ready easing curves & GPU-accelerated motion timing.
================================================================ */

/** Default auto-rotation interval in milliseconds (3 seconds) */
const DEFAULT_AUTO_ROTATE_MS = 3000

/** Snappy cubic-bezier easing curve for flagship UI motion */
const TRANSITION_EASE = [0.16, 1, 0.3, 1] as const

/** Slide animation durations */
const SLIDE_DURATION_S = 0.45
const TEXT_STAGGER_DELAY_S = 0.04

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
  bannerImage?: string
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

interface AmbientColors {
  primary: string
  secondary: string
  glow: string
  accent: string
}

/**
 * Derives a curated color palette for the dynamic radial glow and
 * backdrop illumination behind the hero slide.
 */
function getSlideAmbientColors(slide: HeroSlide): AmbientColors {
  const categorySlug = slide.product?.category?.slug?.toLowerCase() || ''
  const categoryName = slide.product?.category?.name?.toLowerCase() || ''
  const name = (slide.product?.name || slide.titleLine1 || '').toLowerCase()

  if (
    categorySlug.includes('electr') ||
    categoryName.includes('electr') ||
    name.includes('phone') ||
    name.includes('audio') ||
    name.includes('laptop') ||
    name.includes('tech')
  ) {
    return {
      primary: 'rgba(59, 130, 246, 0.42)', // Electric Blue
      secondary: 'rgba(6, 182, 212, 0.38)', // Bright Cyan
      glow: 'rgba(59, 130, 246, 0.28)',
      accent: 'hsl(217, 91%, 60%)',
    }
  }

  if (
    categorySlug.includes('cloth') ||
    categorySlug.includes('fashion') ||
    categoryName.includes('fashion') ||
    name.includes('wear') ||
    name.includes('jacket') ||
    name.includes('shirt')
  ) {
    return {
      primary: 'rgba(236, 72, 153, 0.40)', // Rose Pink
      secondary: 'rgba(249, 115, 22, 0.34)', // Sunset Orange
      glow: 'rgba(236, 72, 153, 0.25)',
      accent: 'hsl(330, 81%, 60%)',
    }
  }

  if (
    categorySlug.includes('home') ||
    categorySlug.includes('kitchen') ||
    categoryName.includes('home')
  ) {
    return {
      primary: 'rgba(245, 158, 11, 0.40)', // Warm Amber
      secondary: 'rgba(16, 185, 129, 0.34)', // Fresh Emerald
      glow: 'rgba(245, 158, 11, 0.25)',
      accent: 'hsl(38, 92%, 50%)',
    }
  }

  if (
    categorySlug.includes('beauty') ||
    categoryName.includes('beauty') ||
    name.includes('care') ||
    name.includes('cosmetic')
  ) {
    return {
      primary: 'rgba(168, 85, 247, 0.42)', // Soft Violet
      secondary: 'rgba(244, 63, 94, 0.36)', // Rose Glow
      glow: 'rgba(168, 85, 247, 0.28)',
      accent: 'hsl(270, 91%, 65%)',
    }
  }

  if (
    categorySlug.includes('sport') ||
    categorySlug.includes('fitness') ||
    categoryName.includes('sport')
  ) {
    return {
      primary: 'rgba(16, 185, 129, 0.42)', // Vibrant Green
      secondary: 'rgba(14, 165, 233, 0.36)', // Sky Blue
      glow: 'rgba(16, 185, 129, 0.28)',
      accent: 'hsl(158, 64%, 52%)',
    }
  }

  // Slide defaults for initial placeholders
  if (slide.id === 'slide-1') {
    return {
      primary: 'rgba(59, 130, 246, 0.42)', // Electric Blue
      secondary: 'rgba(14, 165, 233, 0.36)', // Sky Blue
      glow: 'rgba(59, 130, 246, 0.26)',
      accent: 'hsl(217, 91%, 60%)',
    }
  }
  if (slide.id === 'slide-2') {
    return {
      primary: 'rgba(139, 92, 246, 0.42)', // Royal Purple
      secondary: 'rgba(6, 182, 212, 0.38)', // Cyan
      glow: 'rgba(139, 92, 246, 0.26)',
      accent: 'hsl(258, 90%, 66%)',
    }
  }
  if (slide.id === 'slide-3') {
    return {
      primary: 'rgba(245, 158, 11, 0.42)', // Amber
      secondary: 'rgba(239, 68, 68, 0.36)', // Coral Red
      glow: 'rgba(245, 158, 11, 0.26)',
      accent: 'hsl(38, 92%, 50%)',
    }
  }

  // Deterministic color generation based on product name/id hash
  let hash = 0
  const str = slide.id + (slide.product?.name || '')
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue1 = Math.abs(hash % 360)
  const hue2 = (hue1 + 40) % 360

  return {
    primary: `hsla(${hue1}, 82%, 60%, 0.40)`,
    secondary: `hsla(${hue2}, 82%, 60%, 0.34)`,
    glow: `hsla(${hue1}, 82%, 60%, 0.25)`,
    accent: `hsl(${hue1}, 82%, 60%)`,
  }
}

/* ================================================================
   MAIN HERO SECTION COMPONENT
================================================================ */

export function HeroSection({
  query,
  customSlides,
  autoRotateInterval = DEFAULT_AUTO_ROTATE_MS,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const headingId = useId()
  const sectionRef = useRef<HTMLElement>(null)

  // 1. Filter products that have a dedicated admin-configured bannerImage
  const eligibleProducts =
    query?.data?.content?.filter(
      (p) => typeof p.bannerImage === 'string' && p.bannerImage.trim().length > 0,
    ) ?? []

  // 2. Build slide models: Custom slides -> Admin curated banner products -> Fallback slides
  const slides: HeroSlide[] = customSlides?.length
    ? customSlides
    : eligibleProducts.length > 0
    ? eligibleProducts.slice(0, 5).map((product, idx) => {
        const words = product.name.trim().split(/\s+/)
        const titleLine1 = words.slice(0, Math.min(2, Math.ceil(words.length / 2))).join(' ')
        const titleLine2 = words.slice(Math.min(2, Math.ceil(words.length / 2))).join(' ') || 'Flagship'

        return {
          id: product.publicId,
          eyebrow:
            idx === 0
              ? 'Flagship Highlight · Curated'
              : idx === 1
              ? 'Top Rated · Customer Choice'
              : idx === 2
              ? 'Trending Now · Limited Edition'
              : idx === 3
              ? 'Exclusive Pick · Premium Selection'
              : 'Editor’s Choice · Verified Quality',
          titleLine1,
          titleLine2,
          description:
            product.shortDescription ||
            product.description ||
            'Hand-picked quality products delivered straight to your door with fast, reliable shipping.',
          primaryCtaText: 'Shop product',
          primaryCtaLink: `/products/${product.publicId}`,
          secondaryCtaText: 'View all products',
          secondaryCtaLink: '/products',
          badgeText: product.featured ? 'Featured Flagship' : 'Official Selection',
          bannerImage: product.bannerImage ?? undefined,
          product,
        }
      })
    : DEFAULT_SLIDES

  const totalSlides = slides.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<number>(1) // 1 = next, -1 = prev
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDocVisible, setIsDocVisible] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const activeSlide = slides[currentIndex] ?? slides[0]
  const ambientColors = getSlideAmbientColors(activeSlide)

  // Track Page Visibility API (pause rotation when tab is hidden)
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

  // Auto-rotation timer logic (runs continuously on 3s interval, respects reduced motion & tab visibility)
  useEffect(() => {
    if (totalSlides <= 1 || !isDocVisible || prefersReducedMotion) {
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

  // Keyboard navigation (ArrowLeft & ArrowRight)
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

    if (diff > 45) {
      goToNext() // Swipe left -> Next slide
    } else if (diff < -45) {
      goToPrev() // Swipe right -> Prev slide
    }
    setTouchStart(null)
  }

  return (
    <section
      ref={sectionRef}
      className="group/hero relative overflow-hidden border-b bg-background select-none outline-none"
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      aria-label="Homepage Flagship Hero Showcase"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================
          INTERACTIVE AURORA & AMBIENT ILLUMINATION
      ============================================================ */}
      <AuroraBackground />

      {/* Dynamic Slide Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 lg:right-1/4 w-[600px] sm:w-[800px] h-[450px] sm:h-[600px] rounded-full blur-3xl opacity-40 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${ambientColors.primary} 0%, ${ambientColors.secondary} 45%, transparent 75%)`,
        }}
      />

      {/* ============================================================
          MAIN HERO CONTAINER (Minimal flush vertical spacing)
      ============================================================ */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 max-w-7xl">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8 xl:gap-10">
          {/* ==========================================================
              LEFT CONTENT (STAGGERED ANIMATIONS)
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
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: direction > 0 ? 24 : -24,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: direction > 0 ? -24 : 24,
                      }
                }
                transition={{
                  duration: SLIDE_DURATION_S,
                  ease: TRANSITION_EASE,
                }}
                className="space-y-3 sm:space-y-3.5"
              >
                {/* Eyebrow badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: TEXT_STAGGER_DELAY_S }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {activeSlide.eyebrow}
                  </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  id={headingId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: TEXT_STAGGER_DELAY_S * 2,
                    ease: TRANSITION_EASE,
                  }}
                  className="
                    font-display
                    text-3xl
                    font-extrabold
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-foreground
                    sm:text-4xl
                    md:text-5xl
                    lg:text-[3.15rem]
                    xl:text-[3.5rem]
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
                  transition={{ duration: 0.35, delay: TEXT_STAGGER_DELAY_S * 3 }}
                  className="
                    max-w-lg
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                    sm:text-base
                    sm:leading-normal
                  "
                >
                  {activeSlide.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: TEXT_STAGGER_DELAY_S * 4 }}
                  className="pt-1 flex flex-wrap items-center gap-3"
                >
                  <MagneticHover strength={0.25}>
                    <Button
                      asChild
                      size="lg"
                      className="
                        h-11
                        sm:h-12
                        rounded-xl
                        px-6
                        text-sm
                        font-semibold
                        shadow-lg
                        shadow-primary/20
                        transition-all
                        duration-300
                        hover:shadow-glow
                        hover:-translate-y-0.5
                      "
                    >
                      <Link to={activeSlide.primaryCtaLink}>
                        {activeSlide.primaryCtaText}
                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                      </Link>
                    </Button>
                  </MagneticHover>

                  {activeSlide.secondaryCtaText && (
                    <MagneticHover strength={0.2}>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="
                          h-11
                          sm:h-12
                          rounded-xl
                          px-6
                          text-sm
                          font-semibold
                          glass-surface
                          border-border/80
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-muted/50
                        "
                      >
                        <Link to={activeSlide.secondaryCtaLink ?? '/products'}>
                          {activeSlide.secondaryCtaText}
                          <ChevronRight className="h-4 w-4 ml-1.5" aria-hidden />
                        </Link>
                      </Button>
                    </MagneticHover>
                  )}
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: TEXT_STAGGER_DELAY_S * 5 }}
                  className="
                    pt-2.5
                    grid
                    grid-cols-1
                    gap-2.5
                    border-t
                    border-border/60
                    sm:grid-cols-3
                  "
                >
                  <TrustItem
                    icon={Truck}
                    title="Express delivery"
                    description="Tracked & insured"
                  />
                  <TrustItem
                    icon={ShieldCheck}
                    title="Secure checkout"
                    description="256-bit encryption"
                  />
                  <TrustItem
                    icon={CheckCircle2}
                    title="Hassle-free returns"
                    description="30-day guarantee"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ==========================================================
              RIGHT PRODUCT BANNER SHOWCASE
          ========================================================== */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeSlide.id}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98, y: 10 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 1.02, y: -10 }
                }
                transition={{ duration: SLIDE_DURATION_S, ease: TRANSITION_EASE }}
                className="relative mx-auto w-full max-w-2xl"
              >
                <HeroBannerCard
                  slide={activeSlide}
                  ambientColors={ambientColors}
                  isPending={query?.isPending}
                  prefersReducedMotion={Boolean(prefersReducedMotion)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ============================================================
            CAROUSEL CONTROLS & TIMED PROGRESS INDICATORS
        ============================================================ */}
        {totalSlides > 1 && (
          <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50 pt-2.5 sm:pt-3">
            {/* Progress Dots / Bars */}
            <div className="flex items-center gap-3">
              {slides.map((slide, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.titleLine1} ${slide.titleLine2}`}
                    className="group relative h-3 rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ width: isActive ? '54px' : '14px' }}
                  >
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-full bg-muted-foreground/20 transition-colors group-hover:bg-muted-foreground/35" />

                    {/* Animated Fill Bar for active slide (synced to timer) */}
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

              {/* Slide Counter */}
              <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground tabular-nums">
                0{currentIndex + 1} / 0{totalSlides}
              </span>
            </div>

            {/* Manual Arrows Navigation */}
            <div className="flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover/hero:opacity-100 transition-opacity duration-300">
              <MagneticHover strength={0.3}>
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous slide"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </MagneticHover>

              <MagneticHover strength={0.3}>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
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
   HERO BANNER CARD SUBCOMPONENT
   Cinematic glass frame with ambient lighting and click affordance.
================================================================ */

interface HeroBannerCardProps {
  slide: HeroSlide
  ambientColors: AmbientColors
  isPending?: boolean
  prefersReducedMotion: boolean
}

function HeroBannerCard({
  slide,
  ambientColors,
  isPending,
  prefersReducedMotion,
}: HeroBannerCardProps) {
  const navigate = useNavigate()
  const product = slide.product

  // Discount calculation
  const discount = product?.compareAtPrice
    ? Math.round(
        (1 - Number(product.price) / Number(product.compareAtPrice)) * 100,
      )
    : null

  const showDiscount =
    discount !== null && Number.isFinite(discount) && discount > 0

  // Determine banner image source: bannerImage -> primary product image -> fallback
  const imageSource =
    slide.bannerImage ||
    product?.images.find((img) => img.primary)?.imageUrl ||
    product?.images[0]?.imageUrl

  // Card click target
  const targetLink = slide.primaryCtaLink

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if click was not on an interactive button or anchor
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    navigate(targetLink)
  }

  return (
    <div
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      aria-label={`View ${product?.name ?? slide.titleLine1 + ' ' + slide.titleLine2}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(targetLink)
        }
      }}
      className="
        group/card
        relative
        cursor-pointer
        rounded-3xl
        p-1
        transition-all
        duration-500
        hover:scale-[1.015]
        outline-none
        focus-visible:ring-2
        focus-visible:ring-primary/60
      "
    >
      {/* Ambient Glow Aura behind card */}
      <motion.div
        key={`ambient-aura-${slide.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.6 }}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-3xl blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${ambientColors.glow} 0%, ${ambientColors.primary} 40%, transparent 75%)`,
        }}
      />

      {/* Main Glass Frame */}
      <div className="glass-surface relative overflow-hidden rounded-2xl border border-border/70 shadow-2xl bg-card/75 backdrop-blur-xl">
        {/* Aspect Ratio Container — prevents Layout Shift (CLS) */}
        <div className="relative aspect-[16/10] sm:aspect-[56/31] w-full overflow-hidden bg-muted/40 flex items-center justify-center">
          {/* Subtle Ambient Radial Light Orbs */}
          <motion.div
            key={`orb-left-${slide.id}`}
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.6 }
                : {
                    opacity: [0.4, 0.75, 0.4],
                    scale: [0.95, 1.08, 0.95],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${ambientColors.primary} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />

          <motion.div
            key={`orb-right-${slide.id}`}
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.6 }
                : {
                    opacity: [0.4, 0.75, 0.4],
                    scale: [1.08, 0.95, 1.08],
                  }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="pointer-events-none absolute -right-12 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${ambientColors.secondary} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />

          {isPending ? (
            <div className="skeleton-shimmer h-full w-full relative z-10" />
          ) : imageSource ? (
            <div className="relative z-10 h-full w-full flex items-center justify-center overflow-hidden p-3 sm:p-4">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.025] }}
                transition={{
                  duration: 6,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="h-full w-full flex items-center justify-center"
              >
                <ProductImage
                  src={imageSource}
                  alt={product?.name ?? slide.titleLine1}
                  className="h-full w-full bg-transparent flex items-center justify-center"
                  imgClassName="object-contain sm:object-cover h-full w-full rounded-xl drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover/card:scale-105"
                  fetchPriority="high"
                  loading="eager"
                />
              </motion.div>

              {/* Bottom gradient fade for text legibility */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
              />
            </div>
          ) : (
            <div className="relative z-10 h-full w-full">
              <HeroFallback badgeText={slide.badgeText} />
            </div>
          )}

          {/* Top Left Badge (Curated Highlight) */}
          <div className="absolute left-3.5 top-3.5 z-20">
            <span className="glass-surface inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-md backdrop-blur-md border border-white/20 dark:border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {slide.badgeText}
            </span>
          </div>

          {/* Top Right Discount Badge */}
          {showDiscount && (
            <div className="absolute right-3.5 top-3.5 z-20">
              <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-warm))] to-[hsl(var(--accent-warm)/0.88)] px-3 py-2 text-white shadow-lg ring-1 ring-white/25">
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                  Save
                </span>
                <strong className="font-mono text-base sm:text-lg font-extrabold leading-none mt-0.5">
                  {discount}%
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Product Details Bar */}
        <div className="border-t border-border/60 bg-card/85 backdrop-blur-md px-5 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm sm:text-base font-bold text-foreground group-hover/card:text-primary transition-colors">
                {product?.name ?? `${slide.titleLine1} ${slide.titleLine2}`}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {product ? (product.category?.name ?? 'Featured Product') : 'Curated collection highlight'}
              </p>

              {product && product.averageRating > 0 && (
                <div className="mt-1 flex items-center gap-1.5">
                  <RatingStars value={product.averageRating} size="sm" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {product.averageRating.toFixed(1)}
                  </span>
                  {product.reviewCount > 0 && (
                    <span className="text-[11px] text-muted-foreground/80">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {product && (
              <div className="shrink-0 text-right">
                <p className="font-mono text-lg sm:text-xl font-extrabold tabular-nums text-foreground">
                  {formatPrice(product.price)}
                </p>
                {showDiscount && product.compareAtPrice && (
                  <p className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Rating Badge (Desktop) */}
      {product && product.averageRating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="absolute -bottom-3 right-4 hidden items-center gap-2 rounded-2xl glass-surface px-3 py-2 shadow-xl sm:flex border border-border/80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-warning/15">
            <Star className="h-4 w-4 fill-warning text-warning" aria-hidden />
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-foreground leading-tight">
              {product.averageRating.toFixed(1)}
            </p>
            <p className="text-[9px] text-muted-foreground leading-none">Customer rating</p>
          </div>
        </motion.div>
      )}
    </div>
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
      <div className="absolute inset-0 dot-grid opacity-25" />

      {/* Interactive pointer glow */}
      <div
        ref={pointerRef}
        className="aurora-pointer"
        style={{ opacity: pointerVisible ? 1 : 0 }}
      />

      {/* Top gradient fade for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/90" />
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
    <div className="flex items-start gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-none">{description}</p>
      </div>
    </div>
  )
}

/* ================================================================
   FALLBACK
================================================================ */

function HeroFallback({ badgeText }: { badgeText?: string }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-card/90 to-muted/50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner ring-1 ring-primary/20">
        <Sparkles className="h-7 w-7 text-primary animate-pulse" aria-hidden />
      </div>

      <p className="mt-4 font-display text-lg font-bold text-foreground">
        {badgeText ?? 'New arrivals, curated weekly'}
      </p>

      <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
        Hand-picked products landing in the store right now with exclusive deals.
      </p>
    </div>
  )
}