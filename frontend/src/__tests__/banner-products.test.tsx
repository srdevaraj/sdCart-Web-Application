import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import AdminBannerProductsPage from '@/pages/admin/banner-products'
import { adminService } from '@/services/admin'
import type { ProductResponse } from '@/types'

vi.mock('@/services/admin', () => ({
  adminService: {
    listBannerProducts: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}))

const bannerProduct: ProductResponse = {
  publicId: 'p-banner-1',
  name: 'Ultra HD OLED TV',
  slug: 'ultra-hd-oled-tv',
  sku: 'TV-OLED-01',
  shortDescription: 'Cinematic experience',
  description: 'Full description',
  price: '1299.99',
  compareAtPrice: '1499.99',
  stockQuantity: 15,
  status: 'ACTIVE',
  featured: true,
  bannerImage: 'https://example.com/banner-oled.jpg',
  averageRating: 4.8,
  reviewCount: 24,
  category: { publicId: 'c-1', name: 'Electronics', slug: 'electronics' },
  brand: { publicId: 'b-1', name: 'Acme', slug: 'acme' },
  images: [{ publicId: 'i-1', imageUrl: 'https://example.com/tv.jpg', altText: 'TV', primary: true, sortOrder: 1 }],
  specifications: [],
  createdAt: '2026-01-01T00:00:00Z',
}

describe('AdminBannerProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders banner products with preview, name, status, and only 2 actions (Delete, Deactivate)', async () => {
    vi.mocked(adminService.listBannerProducts).mockResolvedValue([bannerProduct])

    renderWithProviders(<AdminBannerProductsPage />)

    expect(await screen.findByText('Ultra HD OLED TV')).toBeInTheDocument()
    expect(screen.getByText('TV-OLED-01')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()

    // Preview image
    const img = screen.getByAltText('Ultra HD OLED TV banner')
    expect(img).toHaveAttribute('src', 'https://example.com/banner-oled.jpg')

    // Exactly 2 action buttons
    const deleteBtn = screen.getByRole('button', { name: /delete banner image for ultra hd oled tv/i })
    const deactivateBtn = screen.getByRole('button', { name: /deactivate product ultra hd oled tv/i })
    expect(deleteBtn).toBeInTheDocument()
    expect(deactivateBtn).toBeInTheDocument()
  })

  it('shows empty state when no products have a banner image', async () => {
    vi.mocked(adminService.listBannerProducts).mockResolvedValue([])

    renderWithProviders(<AdminBannerProductsPage />)

    expect(await screen.findByText('No banner products found')).toBeInTheDocument()
    expect(screen.getByText(/no products currently have a hero banner image set/i)).toBeInTheDocument()
  })

  it('shows confirmation dialog on Delete and clears bannerImage via updateProduct on confirm', async () => {
    const user = userEvent.setup()
    vi.mocked(adminService.listBannerProducts).mockResolvedValue([bannerProduct])
    vi.mocked(adminService.updateProduct).mockResolvedValue({
      ...bannerProduct,
      bannerImage: null,
    })

    renderWithProviders(<AdminBannerProductsPage />)

    const deleteBtn = await screen.findByRole('button', { name: /delete banner image for ultra hd oled tv/i })
    await user.click(deleteBtn)

    // Confirm dialog appears
    expect(screen.getByText('Remove banner image?')).toBeInTheDocument()
    expect(screen.getByText(/will immediately leave the homepage hero banner rotation/i)).toBeInTheDocument()

    // Confirm action
    const confirmBtn = screen.getByRole('button', { name: 'Delete Banner' })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(adminService.updateProduct).toHaveBeenCalledWith('p-banner-1', { bannerImage: '' })
    })
  })

  it('shows confirmation dialog on Deactivate and calls deleteProduct on confirm', async () => {
    const user = userEvent.setup()
    vi.mocked(adminService.listBannerProducts).mockResolvedValue([bannerProduct])
    vi.mocked(adminService.deleteProduct).mockResolvedValue(undefined)

    renderWithProviders(<AdminBannerProductsPage />)

    const deactivateBtn = await screen.findByRole('button', { name: /deactivate product ultra hd oled tv/i })
    await user.click(deactivateBtn)

    // Confirm dialog appears
    expect(screen.getByText('Deactivate product?')).toBeInTheDocument()
    expect(screen.getByText(/will be hidden from the store catalog/i)).toBeInTheDocument()

    // Confirm action
    const confirmBtn = screen.getByRole('button', { name: 'Deactivate' })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(adminService.deleteProduct).toHaveBeenCalledWith('p-banner-1')
    })
  })
})
