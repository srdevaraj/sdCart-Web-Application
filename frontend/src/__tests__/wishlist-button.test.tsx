import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { WishlistButton } from '@/components/product/wishlist-button'
import { wishlistService } from '@/services/wishlist'
import { useAuthStore } from '@/features/auth/auth-store'
import { toast } from 'sonner'
import type { UserResponse, WishlistResponse } from '@/types'

vi.mock('@/services/wishlist', () => ({
  wishlistService: {
    get: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

const mockUser: UserResponse = {
  publicId: 'u-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: null,
  roles: ['USER'],
  active: true,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockWishlist: WishlistResponse = {
  publicId: 'w-1',
  items: [
    {
      publicId: 'wi-1',
      product: {
        publicId: 'prod-favorited',
        name: 'Favorited Product',
        slug: 'favorited-product',
        price: '99.99',
        imageUrl: null,
        stockQuantity: 10,
      },
      addedAt: '2026-01-01T00:00:00Z',
    },
  ],
}

describe('WishlistButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: mockUser, isAuthenticated: true })
    vi.mocked(wishlistService.get).mockResolvedValue(mockWishlist)
  })

  it('renders unfavorited heart icon for non-wishlisted product', async () => {
    renderWithProviders(<WishlistButton productId="prod-unfavorited" />)

    const button = screen.getByRole('button', { name: 'Add to wishlist' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).not.toBeDisabled()
  })

  it('renders favorited heart icon for already wishlisted product', async () => {
    renderWithProviders(<WishlistButton productId="prod-favorited" />)

    const button = await screen.findByRole('button', { name: 'Remove from wishlist' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows loading indicator and disables button while add request is in progress', async () => {
    let resolveAdd: (val: WishlistResponse) => void = () => {}
    const addPromise = new Promise<WishlistResponse>((resolve) => {
      resolveAdd = resolve
    })
    vi.mocked(wishlistService.addItem).mockReturnValue(addPromise)

    const user = userEvent.setup()
    renderWithProviders(
      <>
        <WishlistButton productId="prod-1" data-testid="btn-1" />
        <WishlistButton productId="prod-2" data-testid="btn-2" />
      </>,
    )

    const button1 = screen.getByTestId('btn-1')
    const button2 = screen.getByTestId('btn-2')

    expect(button1).not.toBeDisabled()
    expect(button2).not.toBeDisabled()

    await user.click(button1)

    // button 1 should now be disabled with aria-busy
    await waitFor(() => {
      expect(button1).toBeDisabled()
      expect(button1).toHaveAttribute('aria-busy', 'true')
    })

    // button 2 MUST remain unaffected (per-item loading isolation)
    expect(button2).not.toBeDisabled()
    expect(button2).toHaveAttribute('aria-busy', 'false')

    // Resolve the mutation
    resolveAdd({ publicId: 'w-1', items: [] })

    await waitFor(() => {
      expect(button1).not.toBeDisabled()
      expect(button1).toHaveAttribute('aria-busy', 'false')
      expect(toast.success).toHaveBeenCalledWith('Added to wishlist')
    })
  })

  it('handles errors gracefully, stops loader, and displays error toast', async () => {
    let rejectRemove: (err: unknown) => void = () => {}
    const removePromise = new Promise<WishlistResponse>((_, reject) => {
      rejectRemove = reject
    })
    vi.mocked(wishlistService.removeItem).mockReturnValue(removePromise)

    const user = userEvent.setup()
    renderWithProviders(<WishlistButton productId="prod-favorited" />)

    const button = await screen.findByRole('button', { name: 'Remove from wishlist' })

    await user.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    // Reject the mutation
    rejectRemove(new Error('Network error'))

    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })
})
