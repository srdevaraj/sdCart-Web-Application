import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { toProductSummaries } from '@/utils/product'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { useBrands, useCategories, useProducts } from '@/features/products/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest' },
  { value: 'price,asc', label: 'Price: low to high' },
  { value: 'price,desc', label: 'Price: high to low' },
  { value: 'averageRating,desc', label: 'Top rated' },
  { value: 'reviewCount,desc', label: 'Most reviewed' },
  { value: 'name,asc', label: 'Name A–Z' },
]

export default function ProductsPage({ title = 'Shop all products' }: { title?: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const inStock = searchParams.get('inStock') === 'true'
  const featured = searchParams.get('featured') === 'true'
  const sort = searchParams.get('sort') ?? SORT_OPTIONS[0].value
  const page = Math.max(0, Number.parseInt(searchParams.get('page') ?? '0', 10) || 0)

  // Debounced search so typing in the search box doesn't hammer the API.
  const debouncedQ = useDebounce(q, 400)

  const query = useProducts({
    q: debouncedQ || undefined,
    category: category || undefined,
    brand: brand || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: inStock || undefined,
    featured: featured || undefined,
    sort: sort || undefined,
    page,
    size: PAGE_SIZE,
  })

  const categories = useCategories(false)
  const brands = useBrands()

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const activeFilterCount = useMemo(
    () => [category, brand, minPrice, maxPrice, inStock, featured].filter(Boolean).length,
    [category, brand, minPrice, maxPrice, inStock, featured],
  )

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Category">
        <div className="space-y-1.5">
          <FilterLink label="All" active={!category} onClick={() => updateParams({ category: null, page: null })} />
          {categories.data?.map((c) => (
            <FilterLink
              key={c.publicId}
              label={c.name}
              active={category === c.slug}
              onClick={() => updateParams({ category: c.slug, page: null })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="space-y-1.5">
          <FilterLink label="All" active={!brand} onClick={() => updateParams({ brand: null, page: null })} />
          {brands.data?.map((b) => (
            <FilterLink
              key={b.publicId}
              label={b.name}
              active={brand === b.slug}
              onClick={() => updateParams({ brand: b.slug, page: null })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value, page: null })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value, page: null })}
          />
        </div>
      </FilterGroup>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={inStock}
            onCheckedChange={(checked) => updateParams({ inStock: checked ? 'true' : null, page: null })}
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={featured}
            onCheckedChange={(checked) => updateParams({ featured: checked ? 'true' : null, page: null })}
          />
          Featured only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSearchParams({})}
        >
          <X className="h-4 w-4" aria-hidden /> Clear all filters
        </Button>
      )}
    </div>
  )

  const productSummaries = useMemo(
    () => toProductSummaries(query.data?.content ?? []),
    [query.data?.content],
  )

  return (
    <div className="container py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {query.data
            ? `${query.data.totalElements.toLocaleString()} product${query.data.totalElements === 1 ? '' : 's'}`
            : 'Browse the full catalog'}
          {category && (
            <>
              {' in '}
              <Link
                to="/products"
                className="font-medium text-primary hover:underline"
                onClick={() => updateParams({ category: null })}
              >
                {categories.data?.find((c) => c.slug === category)?.name ?? category}
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
          <Filter className="h-4 w-4" aria-hidden />
          {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
        </div>
        <Select value={sort} onValueChange={(value) => updateParams({ sort: value, page: null })}>
          <SelectTrigger className="w-auto gap-2 sm:w-48" aria-label="Sort products">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">{filters}</aside>

        {/* Mobile filters */}
        {filtersOpen && (
          <div className="lg:hidden">
            <div className="rounded-lg border p-4">{filters}</div>
          </div>
        )}

        <section aria-label="Products">
          {query.isError ? (
            <ErrorState onRetry={() => query.refetch()} message="We couldn't load products." />
          ) : query.isPending ? (
            <ProductGrid products={[]} loading skeletonCount={PAGE_SIZE} />
          ) : query.data.empty ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              action={
                <Button variant="outline" onClick={() => setSearchParams({})}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={productSummaries} />
              <Pagination
                className="mt-8"
                page={query.data.page}
                totalPages={query.data.totalPages}
                onPageChange={(next) => {
                  updateParams({ page: next === 0 ? null : String(next) })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

interface FilterLinkProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterLink({ label, active, onClick }: FilterLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full rounded px-2 py-1 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
        active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
    </button>
  )
}


