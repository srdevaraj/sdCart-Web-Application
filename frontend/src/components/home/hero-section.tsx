import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MotionReveal, MagneticHover } from '@/components/common/motion'
import { ProductImage } from '@/components/common/product-image'
import { RatingStars } from '@/components/common/rating-stars'
import { formatPrice } from '@/utils/format'
import type { PageResponse } from '@/types/api'
import type { ProductResponse } from '@/types'

interface HeroSectionProps {
  query: {
    data?: PageResponse<ProductResponse>
    isPending: boolean
  }
}

export function HeroSection({ query }: HeroSectionProps) {
  const heroProduct =
    query.data?.content.find(
      (product) => product.images.length > 0,
    ) ?? query.data?.content[0]

  const discount = heroProduct?.compareAtPrice
    ? Math.round(
        (1 -
          Number(heroProduct.price) /
            Number(heroProduct.compareAtPrice)) *
          100,
      )
    : null

  const showDiscount =
    discount !== null &&
    Number.isFinite(discount) &&
    discount > 0

  return (
    <section
      className="relative overflow-hidden border-b bg-background"
      aria-labelledby="hero-heading"
    >
      {/* ============================================================
          INTERACTIVE AURORA BACKGROUND
      ============================================================ */}

      <AuroraBackground />

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <div
        className="
          container
          relative
          z-10
          grid
          items-center
          gap-8
          py-12
          sm:py-16
          lg:grid-cols-[0.9fr_1.1fr]
          lg:gap-12
          lg:py-20
          xl:gap-16
        "
      >
        {/* ==========================================================
            LEFT CONTENT
        ========================================================== */}

        <div className="max-w-xl">
          {/* Eyebrow */}

          <MotionReveal>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles
                  className="h-3.5 w-3.5"
                  aria-hidden
                />
              </span>

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                New season · Fresh arrivals
              </span>
            </div>
          </MotionReveal>

          {/* Heading */}

          <MotionReveal delay={0.06}>
            <h1
              id="hero-heading"
              className="
                mt-4
                max-w-2xl
                font-display
                text-[2.45rem]
                font-extrabold
                leading-[0.98]
                tracking-[-0.045em]
                text-foreground
                sm:text-5xl
                lg:text-[3.45rem]
                xl:text-[3.8rem]
              "
            >
              Everything you need.
              <span className="block bg-gradient-to-r from-primary via-[hsl(var(--accent-glow))] to-primary bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h1>
          </MotionReveal>

          {/* Description */}

          <MotionReveal delay={0.12}>
            <p
              className="
                mt-5
                max-w-lg
                text-sm
                leading-6
                text-muted-foreground
                sm:text-base
                sm:leading-7
              "
            >
              Shop quality products across electronics, fashion,
              home essentials and everyday favorites — all in one
              simple shopping experience.
            </p>
          </MotionReveal>

          {/* CTA */}

          <MotionReveal delay={0.18}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MagneticHover strength={0.25}>
                <Button
                  asChild
                  size="lg"
                  className="
                    h-11
                    rounded-xl
                    px-6
                    text-sm
                    font-semibold
                    shadow-md
                    transition-shadow
                    duration-300
                    hover:shadow-glow
                  "
                >
                  <Link to="/products">
                    Shop now
                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden
                    />
                  </Link>
                </Button>
              </MagneticHover>

              <MagneticHover strength={0.2}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="
                    h-11
                    rounded-xl
                    px-6
                    text-sm
                    font-semibold
                    glass-surface
                  "
                >
                  <Link to="/categories">
                    Explore categories
                    <ChevronRight
                      className="h-4 w-4"
                      aria-hidden
                    />
                  </Link>
                </Button>
              </MagneticHover>
            </div>
          </MotionReveal>

          {/* Trust indicators */}

          <MotionReveal delay={0.24}>
            <div
              className="
                mt-7
                grid
                max-w-lg
                grid-cols-1
                gap-3
                border-t
                pt-5
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
            </div>
          </MotionReveal>
        </div>

        {/* ==========================================================
            RIGHT PRODUCT SHOWCASE — GLASSMORPHISM CARD
        ========================================================== */}

        <MotionReveal
          delay={0.14}
          className="relative"
        >
          <div className="relative mx-auto max-w-2xl">
            {/* Ambient glow behind card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/15 via-transparent to-[hsl(var(--accent-glow)/0.1)] blur-2xl"
            />

            {/* Main product container */}

            <div
              className="
                glass-surface
                relative
                overflow-hidden
                rounded-2xl
                shadow-glass
                dark:shadow-glass-dark
              "
            >
              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div
                className="
                  relative
                  aspect-[5/3]
                  overflow-hidden
                  bg-muted
                "
              >
                {query.isPending ? (
                  <div className="skeleton-shimmer h-full w-full" />
                ) : heroProduct ? (
                  <>
                    <ProductImage
                      src={
                        heroProduct.images.find(
                          (img) => img.primary,
                        )?.imageUrl ??
                        heroProduct.images[0]?.imageUrl
                      }
                      alt={heroProduct.name}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        hover:scale-[1.03]
                      "
                    />

                    {/* Image overlay */}

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-32
                        bg-gradient-to-t
                        from-black/30
                        via-black/10
                        to-transparent
                      "
                    />
                  </>
                ) : (
                  <HeroFallback />
                )}

                {/* Product badge */}

                <div className="absolute left-4 top-4">
                  <span
                    className="
                      glass-surface
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-foreground
                      shadow-sm
                    "
                  >
                    <Sparkles
                      className="h-3 w-3 text-primary"
                      aria-hidden
                    />

                    {heroProduct
                      ? 'Featured product'
                      : 'New arrivals'}
                  </span>
                </div>

                {/* Discount */}

                {showDiscount && (
                  <div className="absolute right-4 top-4">
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        rounded-xl
                        bg-gradient-to-br
                        from-[hsl(var(--accent-warm))]
                        to-[hsl(var(--accent-warm)/0.85)]
                        px-3
                        py-2
                        text-white
                        shadow-glow-warm
                      "
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-wider">
                        Save
                      </span>

                      <strong className="font-mono text-lg font-extrabold leading-none">
                        {discount}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================================
                  PRODUCT INFORMATION
              ================================================== */}

              <div className="border-t border-border/50 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {heroProduct?.name ?? 'Curated quality'}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {heroProduct
                        ? 'Featured this week'
                        : 'Hand-picked products every week'}
                    </p>

                    {heroProduct &&
                      heroProduct.averageRating > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <RatingStars
                            value={heroProduct.averageRating}
                            size="sm"
                          />

                          <span className="text-xs font-medium text-muted-foreground">
                            {heroProduct.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                  </div>

                  {heroProduct && (
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-lg font-bold tabular-nums">
                        {formatPrice(heroProduct.price)}
                      </p>

                      {showDiscount &&
                        heroProduct.compareAtPrice && (
                          <p className="font-mono text-xs text-muted-foreground line-through">
                            {formatPrice(
                              heroProduct.compareAtPrice,
                            )}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ======================================================
                SMALL RATING PANEL — FLOATING
            ====================================================== */}

            {heroProduct &&
              heroProduct.averageRating > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="
                    absolute
                    -bottom-3
                    right-4
                    hidden
                    items-center
                    gap-2
                    rounded-xl
                    glass-surface
                    px-3
                    py-2
                    shadow-glass
                    dark:shadow-glass-dark
                    sm:flex
                  "
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
                    <Star
                      className="h-3.5 w-3.5 fill-warning text-warning"
                      aria-hidden
                    />
                  </div>

                  <div>
                    <p className="font-mono text-xs font-bold">
                      {heroProduct.averageRating.toFixed(1)}
                    </p>

                    <p className="text-[9px] text-muted-foreground">
                      Customer rating
                    </p>
                  </div>
                </motion.div>
              )}
          </div>
        </MotionReveal>
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
    <div className="flex items-start gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon
          className="h-3.5 w-3.5"
          aria-hidden
        />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ================================================================
   FALLBACK
================================================================ */

function HeroFallback() {
  return (
    <div
      className="
        flex
        h-full
        min-h-[280px]
        flex-col
        items-center
        justify-center
        px-8
        text-center
      "
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
        <Sparkles
          className="h-7 w-7 text-primary"
          aria-hidden
        />
      </div>

      <p className="mt-4 font-display text-lg font-bold">
        New arrivals, curated weekly
      </p>

      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Hand-picked products landing in the store right now.
      </p>
    </div>
  )
}