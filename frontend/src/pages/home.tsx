import { HeroSection } from '@/components/home/hero-section'
import { CategorySection } from '@/components/home/category-section'
import { PromoSection } from '@/components/home/promo-section'
import { BenefitsSection } from '@/components/home/benefits-section'
import { ProductSection } from '@/components/product/product-section'
import { useCategories, useProducts } from '@/features/products/hooks'

export default function HomePage() {
  const featured = useProducts({ featured: true, size: 8 })
  const newArrivals = useProducts({ sort: 'createdAt,desc', size: 8 })
  const bestSellers = useProducts({ sort: 'reviewCount,desc', size: 8 })
  const trending = useProducts({ sort: 'averageRating,desc', size: 8 })
  const categories = useCategories(false)

  return (
    <>
      <HeroSection query={featured} />

      <CategorySection query={categories} />

      <div className="container space-y-16 py-14 lg:space-y-24 lg:py-20">
        <ProductSection
          eyebrow="Featured for you"
          title="Curated picks worth discovering"
          subtitle="Hand-picked favourites from across the store."
          viewAllTo="/products?featured=true"
          query={featured}
        />

        <ProductSection
          eyebrow="Trending now"
          title="What everyone's loving"
          subtitle="Top-rated by shoppers this month."
          viewAllTo="/products?sort=averageRating,desc"
          variant="rail"
          query={trending}
        />

        <ProductSection
          eyebrow="New arrivals"
          title="Fresh off the shelves"
          subtitle="The latest additions, straight from the warehouse."
          viewAllTo="/products?sort=createdAt,desc"
          variant="editorial"
          query={newArrivals}
          className="rounded-3xl bg-muted/40 p-6 sm:p-10"
        />

        <ProductSection
          eyebrow="Best sellers"
          title="The people's choice"
          subtitle="The products everyone is buying right now."
          viewAllTo="/products?sort=reviewCount,desc"
          variant="ranked"
          query={bestSellers}
        />
      </div>

      <PromoSection />

      <BenefitsSection />
    </>
  )
}
