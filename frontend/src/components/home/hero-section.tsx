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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/common/reveal'
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
          SUBTLE BACKGROUND
      ============================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.025] to-transparent" />

        <div
          className="
            absolute
            right-[-160px]
            top-[-180px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-primary/[0.045]
            blur-3xl
          "
        />
      </div>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <div
        className="
          container
          relative
          grid
          items-center
          gap-8
          py-10
          sm:py-12
          lg:grid-cols-[0.9fr_1.1fr]
          lg:gap-12
          lg:py-14
          xl:gap-16
        "
      >
        {/* ==========================================================
            LEFT CONTENT
        ========================================================== */}

        <div className="max-w-xl">
          {/* Eyebrow */}

          <Reveal>
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
          </Reveal>

          {/* Heading */}

          <Reveal delay={60}>
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
              <span className="block text-primary">
                Nothing you don't.
              </span>
            </h1>
          </Reveal>

          {/* Description */}

          <Reveal delay={120}>
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
          </Reveal>

          {/* CTA */}

          <Reveal delay={180}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="
                  h-10
                  rounded-md
                  px-5
                  text-sm
                  font-semibold
                  shadow-sm
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

              <Button
                asChild
                variant="outline"
                size="lg"
                className="
                  h-10
                  rounded-md
                  px-5
                  text-sm
                  font-semibold
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
            </div>
          </Reveal>

          {/* Trust indicators */}

          <Reveal delay={240}>
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
          </Reveal>
        </div>

        {/* ==========================================================
            RIGHT PRODUCT SHOWCASE
        ========================================================== */}

        <Reveal
          delay={140}
          className="relative"
        >
          <div className="relative mx-auto max-w-2xl">
            {/* Main product container */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                bg-card
                shadow-[0_20px_55px_-30px_hsl(var(--foreground)/0.28)]
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
                  <Skeleton className="h-full w-full rounded-none" />
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
                        duration-500
                        ease-out
                        hover:scale-[1.02]
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
                        h-28
                        bg-gradient-to-t
                        from-black/20
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
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-white/30
                      bg-background/90
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-foreground
                      shadow-sm
                      backdrop-blur-md
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
                        rounded-lg
                        bg-primary
                        px-3
                        py-2
                        text-primary-foreground
                        shadow-lg
                      "
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-wider">
                        Save
                      </span>

                      <strong className="text-lg font-extrabold leading-none">
                        {discount}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================================
                  PRODUCT INFORMATION
              ================================================== */}

              <div className="border-t px-4 py-4 sm:px-5">
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
                      <p className="font-display text-lg font-bold tabular-nums">
                        {formatPrice(heroProduct.price)}
                      </p>

                      {showDiscount &&
                        heroProduct.compareAtPrice && (
                          <p className="text-xs text-muted-foreground line-through">
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
                SMALL RATING PANEL
            ====================================================== */}

            {heroProduct &&
              heroProduct.averageRating > 0 && (
                <div
                  className="
                    absolute
                    -bottom-3
                    right-4
                    hidden
                    items-center
                    gap-2
                    rounded-lg
                    border
                    bg-card
                    px-3
                    py-2
                    shadow-lg
                    sm:flex
                  "
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/10">
                    <Star
                      className="h-3.5 w-3.5 fill-warning text-warning"
                      aria-hidden
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      {heroProduct.averageRating.toFixed(1)}
                    </p>

                    <p className="text-[9px] text-muted-foreground">
                      Customer rating
                    </p>
                  </div>
                </div>
              )}
          </div>
        </Reveal>
      </div>
    </section>
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