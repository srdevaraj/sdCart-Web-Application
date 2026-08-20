import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import CartPage from '@/pages/cart'
import { cartService } from '@/services/cart'
import { couponService } from '@/services/coupons'
import { useAuthStore } from '@/features/auth/auth-store'
import type { CartResponse } from '@/types'

vi.mock('@/services/cart', () => ({
  cartService: {
    get: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/services/coupons', () => ({
  couponService: { validate: vi.fn() },
}))

const cart: CartResponse = {
  publicId: 'cart-1',
  items: [
    {
      publicId: 'item-1',
      product: {
        publicId: 'p-1',
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        price: '249.99',
        imageUrl: 'https://example.com/h.jpg',
        stockQuantity: 25,
      },
      quantity: 2,
      unitPrice: '249.99',
      subtotal: '499.98',
    },
  ],
  totalQuantity: 2,
  totalAmount: '499.98',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'a',
      refreshToken: 'r',
      isAuthenticated: true,
      user: {
        publicId: 'u-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: null,
        roles: ['USER'],
        active: true,
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    })
  })

  it('renders cart items and the authoritative total from the backend', async () => {
    vi.mocked(cartService.get).mockResolvedValue(cart)

    renderWithProviders(<CartPage />)

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getAllByText('₹499.98').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Proceed to checkout/ })).toBeInTheDocument()
  })

  it('shows the empty state for an empty cart', async () => {
    vi.mocked(cartService.get).mockResolvedValue({ ...cart, items: [], totalQuantity: 0, totalAmount: '0' })

    renderWithProviders(<CartPage />)

    expect(await screen.findByText('Your cart is waiting')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore products/i })).toBeInTheDocument()
  })

  it('updates quantity through the backend and re-renders', async () => {
    let current = cart
    vi.mocked(cartService.get).mockImplementation(async () => current)
    vi.mocked(cartService.updateItem).mockImplementation(async () => {
      current = {
        ...cart,
        items: [{ ...cart.items[0], quantity: 3, subtotal: '749.97' }],
        totalQuantity: 3,
        totalAmount: '749.97',
      }
      return current
    })

    renderWithProviders(<CartPage />)
    const input = await screen.findByLabelText('Quantity')
    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(cartService.updateItem).toHaveBeenCalledWith('item-1', { quantity: 3 }),
    )
    await waitFor(() => expect(screen.getAllByText('₹749.97').length).toBeGreaterThan(0))
  })

  it('removes an item when requested', async () => {
    let current = cart
    vi.mocked(cartService.get).mockImplementation(async () => current)
    vi.mocked(cartService.removeItem).mockImplementation(async () => {
      current = { ...cart, items: [], totalQuantity: 0, totalAmount: '0' }
      return current
    })

    renderWithProviders(<CartPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Remove Wireless Headphones from cart' }))

    await waitFor(() => expect(cartService.removeItem).toHaveBeenCalledWith('item-1'))
    expect(await screen.findByText('Your cart is waiting')).toBeInTheDocument()
  })

  it('applies a valid coupon and shows the discount', async () => {
    vi.mocked(cartService.get).mockResolvedValue(cart)
    vi.mocked(couponService.validate).mockResolvedValue({
      valid: true,
      code: 'SAVE20',
      type: 'FIXED',
      discountAmount: '20.00',
      message: 'Coupon applied',
    })

    renderWithProviders(<CartPage />)
    fireEvent.change(await screen.findByLabelText('Coupon code'), { target: { value: 'SAVE20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('SAVE20')).toBeInTheDocument()
    expect(screen.getAllByText('−₹20.00').length).toBeGreaterThan(0)
  })
})
