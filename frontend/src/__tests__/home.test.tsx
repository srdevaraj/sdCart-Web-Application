import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import HomePage from '@/pages/home'
import { productService } from '@/services/products'
import { catalogService } from '@/services/catalog'
import type { PageResponse } from '@/types/api'
import type { ProductResponse, CategoryResponse } from '@/types'

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

const category: CategoryResponse = {
  publicId: 'c-1',
  name: 'Electronics',
  slug: 'electronics',
  description: null,
  imageUrl: null,
  sortOrder: 1,
  active: true,
  parent: null,
  children: [],
}

const page = (content: ProductResponse[]): PageResponse<ProductResponse> => ({
  content,
  page: 0,
  size: 8,
  totalElements: content.length,
  totalPages: 1,
  first: true,
  last: true,
  empty: content.length === 0,
})

describe('HomePage smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(catalogService.getCategories).mockResolvedValue([category])
    vi.mocked(productService.list).mockResolvedValue(page([product]))
  })

  it('renders hero, categories and product sections with real data', async () => {
    renderWithProviders(<HomePage />)

    expect(await screen.findByText('Shop smart.')).toBeInTheDocument()
    expect(screen.getByText('Live better.')).toBeInTheDocument()
    expect(await screen.findByText('Electronics')).toBeInTheDocument()
    expect(await screen.findAllByText('Wireless Headphones')).toBeTruthy()
    expect(screen.getAllByText('$249.99').length).toBeGreaterThan(0)
    expect(screen.getByText('WELCOME10')).toBeInTheDocument()
    expect(screen.getByText('A store designed around you')).toBeInTheDocument()
    // All four product queries + categories are issued exactly once each.
    expect(productService.list).toHaveBeenCalledTimes(4)
    expect(catalogService.getCategories).toHaveBeenCalledTimes(1)
  })

  it('renders an empty wishlist-style empty state when there are no products', async () => {
    vi.mocked(productService.list).mockResolvedValue(page([]))
    renderWithProviders(<HomePage />)
    expect(await screen.findAllByText('Nothing here yet')).toBeTruthy()
  })

  it('renders curated product in hero when bannerImage is present', async () => {
    const bannerProduct: ProductResponse = {
      ...product,
      publicId: 'p-banner',
      name: 'Flagship Studio Headphones Pro',
      bannerImage: 'https://example.com/banner-hero.jpg',
    }
    vi.mocked(productService.list).mockResolvedValue(page([bannerProduct]))

    renderWithProviders(<HomePage />)

    expect(await screen.findByText('Flagship Studio')).toBeInTheDocument()
    expect(screen.getByText('Headphones Pro')).toBeInTheDocument()
    expect(screen.getByText('Shop product')).toBeInTheDocument()
  })
})
