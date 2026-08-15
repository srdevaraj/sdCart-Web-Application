import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { AddressForm } from '@/features/addresses/address-form'
import { addressService } from '@/services/addresses'

vi.mock('@/services/addresses', () => ({
  addressService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setDefault: vi.fn(),
  },
}))

describe('AddressForm (checkout / address book)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors for required fields', async () => {
    renderWithProviders(<AddressForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Save address' }))

    expect(await screen.findByText('Recipient name is required')).toBeInTheDocument()
    expect(screen.getByText('Phone is required')).toBeInTheDocument()
    expect(screen.getByText('Address line 1 is required')).toBeInTheDocument()
    expect(screen.getByText('City is required')).toBeInTheDocument()
    expect(screen.getByText('Country is required')).toBeInTheDocument()
    expect(addressService.create).not.toHaveBeenCalled()
  })

  it('creates an address with valid data', async () => {
    vi.mocked(addressService.create).mockResolvedValue({
      publicId: 'addr-1',
      label: 'Home',
      recipientName: 'Jane Doe',
      phone: '555-0100',
      line1: '100 Market St',
      line2: null,
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      isDefault: true,
    })

    renderWithProviders(<AddressForm />)
    fireEvent.change(screen.getByLabelText(/Label/), { target: { value: 'Home' } })
    fireEvent.change(screen.getByLabelText(/Recipient name/), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-0100' } })
    fireEvent.change(screen.getByLabelText(/Address line 1/), { target: { value: '100 Market St' } })
    fireEvent.change(screen.getByLabelText(/City/), { target: { value: 'San Francisco' } })
    fireEvent.change(screen.getByLabelText(/Country/), { target: { value: 'United States' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save address' }))

    await waitFor(() =>
      expect(addressService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Home',
          recipientName: 'Jane Doe',
          line1: '100 Market St',
          city: 'San Francisco',
        }),
      ),
    )
  })
})
