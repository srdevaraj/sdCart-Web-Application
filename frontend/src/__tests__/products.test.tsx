import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import ProductsPage from '@/pages/products'
import { productService } from '@/services/products'
import { catalogService } from '@/services/catalog'
import type { PageResponse } from '@/types/api'
import type { ProductResponse } from '@/types'

vi.mock('@/services/products', () => ({
  productService: { list: vi.fn(), get: vi.fn() },
}))

vi.mock('@/services/catalog', () => ({
  catalogService: {
    getCategories: vi.fn(),
    getCategory: vi.fn(),
    getBrands: vi.fn(),
    getBrand: vi.fn(),
  },
}))

const product: ProductResponse = {
  publicId: 'p-1',
  name: 'Wireless Headphones',
  slug: 'wireless-headphones',
  sku: 'SKU-1',
  shortDescription: 'Great sound',
  description: 'Full description',
  price: '249.99',
  compareAtPrice: '299.99',
  stockQuantity: 25,
  status: 'ACTIVE',
  featured: true,
  averageRating: 4.6,
  reviewCount: 12,
  category: { publicId: 'c-1', name: 'Electronics', slug: 'electronics' },
  brand: { publicId: 'b-1', name: 'Acme', slug: 'acme' },
  images: [{ publicId: 'i-1', imageUrl: 'https://example.com/headphones.jpg', altText: 'Headphones', primary: true, sortOrder: 1 }],
  specifications: [],
  createdAt: '2026-01-01T00:00:00Z',
}

const page = (content: ProductResponse[], empty: boolean): PageResponse<ProductResponse> => ({
  content,
  page: 0,
  size: 12,
  totalElements: content.length,
  totalPages: content.length === 0 ? 0 : 1,
  first: true,
  last: true,
  empty,
})

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(catalogService.getCategories).mockResolvedValue([])
    vi.mocked(catalogService.getBrands).mockResolvedValue([])
  })

  it('renders products returned by the API', async () => {
    vi.mocked(productService.list).mockResolvedValue(page([product], false))

    renderWithProviders(<ProductsPage />)

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('$249.99')).toBeInTheDocument()
    // The list request is server-side with the default sort.
    expect(productService.list).toHaveBeenCalledWith(expect.objectContaining({ size: 12 }))
  })

  it('sends the search query to the API', async () => {
    vi.mocked(productService.list).mockResolvedValue(page([product], false))

    renderWithProviders(<ProductsPage />, { route: '/products?q=headphones' })

    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith(expect.objectContaining({ q: 'headphones' })),
    )
  })

  it('sends category and price filters as slugs/numbers', async () => {
    vi.mocked(productService.list).mockResolvedValue(page([product], false))

    renderWithProviders(<ProductsPage />, {
      route: '/products?category=electronics&minPrice=100&maxPrice=300&inStock=true&featured=true&sort=price,asc',
    })

    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'electronics',
          minPrice: 100,
          maxPrice: 300,
          inStock: true,
          featured: true,
          sort: 'price,asc',
        }),
      ),
    )
  })

  it('shows the empty state when there are no results', async () => {
    vi.mocked(productService.list).mockResolvedValue(page([], true))

    renderWithProviders(<ProductsPage />)

    expect(await screen.findByText('No products found')).toBeInTheDocument()
  })

  it('shows an error state with retry when the request fails', async () => {
    vi.mocked(productService.list).mockRejectedValue(new Error('Network error'))

    renderWithProviders(<ProductsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load products")
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
