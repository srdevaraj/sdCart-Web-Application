import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CreditCard, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductSection } from '@/components/product/product-section'
import { ErrorState } from '@/components/common/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories, useProducts } from '@/features/products/hooks'
import type { CategoryResponse } from '@/types'

export default function HomePage() {
  const featured = useProducts({ featured: true, size: 8 })
  const newArrivals = useProducts({ sort: 'createdAt,desc', size: 8 })
  const bestSellers = useProducts({ sort: 'reviewCount,desc', size: 8 })
  const trending = useProducts({ sort: 'averageRating,desc', size: 8 })
  const categories = useCategories(false)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/40">
        <div className="container grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> New season collection is here
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Shop smart.
              <br />
              <span className="text-primary">Live better.</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Discover electronics, fashion, home essentials and more — curated quality, fair prices and
              delivery you can count on.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  Shop now <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/categories">Browse categories</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block" aria-hidden>
            <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-pop">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Deal of the week</p>
                  <p className="mt-1 font-display text-3xl font-bold text-primary">Up to 20% off</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Selected electronics and home essentials. While stocks last.
              </p>
              <Button asChild variant="secondary" className="mt-6 w-full">
                <Link to="/products?featured=true">View featured deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12" aria-labelledby="categories-heading">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="categories-heading" className="font-display text-2xl font-bold tracking-tight">
            Shop by category
          </h2>
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All categories <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {categories.isError ? (
          <ErrorState onRetry={() => categories.refetch()} message="We couldn't load categories." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.isPending
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)
              : categories.data?.map((category) => <CategoryCard key={category.publicId} category={category} />)}
          </div>
        )}
      </section>

      {/* Product sections */}
      <div className="container space-y-14 pb-16">
        <ProductSection
          title="Featured products"
          subtitle="Hand-picked favourites from across the store"
          viewAllTo="/products?featured=true"
          query={featured}
        />
        <ProductSection
          title="Trending now"
          subtitle="Top-rated by shoppers this month"
          viewAllTo="/products?sort=averageRating,desc"
          query={trending}
        />
        <ProductSection
          title="New arrivals"
          subtitle="Fresh stock, just added"
          viewAllTo="/products?sort=createdAt,desc"
          query={newArrivals}
        />
        <ProductSection
          title="Best sellers"
          subtitle="The products everyone is buying"
          viewAllTo="/products?sort=reviewCount,desc"
          query={bestSellers}
        />
      </div>

      {/* Promotional banner */}
      <section className="bg-primary">
        <div className="container flex flex-col items-center justify-between gap-6 py-14 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground">Summer sale — save big</h2>
            <p className="mt-2 text-primary-foreground/80">
              Use code <strong className="font-semibold">WELCOME10</strong> at checkout for 10% off orders over $50.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link to="/products">Shop the sale</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="container grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4" aria-label="Store benefits">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border bg-card p-5">
            <Icon className="h-6 w-6 text-primary" aria-hidden />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </>
  )
}

function CategoryCard({ category }: { category: CategoryResponse }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative flex h-36 items-end overflow-hidden rounded-lg border bg-muted p-4 transition-shadow hover:shadow-pop"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
      <h3 className="relative z-10 font-semibold text-white">{category.name}</h3>
    </Link>
  )
}

const BENEFITS = [
  { icon: Truck, title: 'Free shipping', text: 'On all orders over $50, delivered in 2–5 business days.' },
  { icon: RefreshCcw, title: 'Easy returns', text: '30-day hassle-free returns on every purchase.' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Encrypted payments and buyer protection.' },
  { icon: CreditCard, title: 'Flexible payment', text: 'Cards, PayPal and cash on delivery available.' },
]
