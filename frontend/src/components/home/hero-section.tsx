import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/common/reveal'
import { ProductImage } from '@/components/common/product-image'
import { RatingStars } from '@/components/common/rating-stars'
import { formatPrice } from '@/utils/format'
import type { PageResponse } from '@/types/api'
import type { ProductResponse } from '@/types'

interface HeroSectionProps {
  /** The homepage's featured-products query; the hero showcases the top item. */
  query: {
    data?: PageResponse<ProductResponse>
    isPending: boolean
  }
}

export function HeroSection({ query }: HeroSectionProps) {
  const heroProduct = query.data?.content.find((product) => product.images.length > 0) ?? query.data?.content[0]
  const discount = heroProduct?.compareAtPrice
    ? Math.round((1 - Number(heroProduct.price) / Number(heroProduct.compareAtPrice)) * 100)
    : null
  const showDiscount = discount !== null && Number.isFinite(discount) && discount > 0

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-accent/70 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* Copy */}
        <div className="max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              New season collection is here
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1
              id="hero-heading"
              className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            >
              Shop smart.
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                Live better.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Discover electronics, fashion, home essentials and more — curated quality, fair prices and
              delivery you can count on.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group h-12 rounded-full px-7 text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/products">
                  Explore products
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group h-12 rounded-full border-2 px-7 text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/categories">Browse categories</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-7 text-xs text-muted-foreground sm:text-sm">
              Free shipping on orders over $50 · 30-day easy returns · Secure checkout
            </p>
          </Reveal>
        </div>

        {/* Visual showcase */}
        <Reveal delay={320} className="relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/50 to-transparent blur-2xl"
            />

            <div className="relative overflow-hidden rounded-[2rem] border bg-card shadow-lift">
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted via-accent/40 to-primary/10">
                {query.isPending ? (
                  <Skeleton className="h-full w-full rounded-none" />
                ) : heroProduct ? (
                  <ProductImage
                    src={heroProduct.images.find((img) => img.primary)?.imageUrl ?? heroProduct.images[0]?.imageUrl}
                    alt={heroProduct.name}
                    className="h-full w-full"
                  />
                ) : (
                  <HeroFallback />
                )}

                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                  {heroProduct ? 'Best seller' : 'New in'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{heroProduct?.name ?? 'Curated quality'}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {heroProduct ? 'Featured this week' : 'Hand-picked weekly edit'}
                  </p>
                </div>
                {heroProduct && (
                  <p className="shrink-0 font-display text-lg font-bold tabular-nums">
                    {formatPrice(heroProduct.price)}
                  </p>
                )}
              </div>
            </div>

            {heroProduct && heroProduct.averageRating > 0 && (
              <div className="absolute -right-2 top-10 hidden animate-float rounded-2xl border bg-card/95 p-3 shadow-pop backdrop-blur sm:block">
                <RatingStars value={heroProduct.averageRating} size="md" />
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                  Top rated
                </p>
              </div>
            )}

            {showDiscount && (
              <div className="absolute -left-3 bottom-24 animate-float-slow rounded-2xl border bg-card/95 p-4 shadow-pop backdrop-blur">
                <p className="font-display text-2xl font-extrabold tabular-nums text-primary">-{discount}%</p>
                <p className="text-xs text-muted-foreground">Limited offer</p>
              </div>
            )}

            <Sparkles
              className="absolute -top-5 right-10 h-8 w-8 animate-float text-primary/50"
              aria-hidden
            />
            <div
              aria-hidden
              className="absolute -bottom-6 left-6 h-16 w-16 rotate-6 rounded-2xl border bg-accent/60"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Branded placeholder used when no featured product is available yet. */
function HeroFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary" aria-hidden />
      </div>
      <p className="font-display text-xl font-bold">New arrivals, curated weekly</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Hand-picked products landing in the store right now.
      </p>
    </div>
  )
}
