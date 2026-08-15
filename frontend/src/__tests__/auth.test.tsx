import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { LoginForm } from '@/features/auth/login-form'
import { RegisterForm } from '@/features/auth/register-form'
import { useAuthStore } from '@/features/auth/auth-store'
import { authService } from '@/services/auth'
import type { TokenResponse } from '@/types'

vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}))

const tokens: TokenResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    publicId: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: null,
    roles: ['USER'],
    active: true,
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  it('shows validation errors when fields are empty', async () => {
    renderWithProviders(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('validates the email format', async () => {
    renderWithProviders(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('calls the login API and stores tokens on success', async () => {
    vi.mocked(authService.login).mockResolvedValue(tokens)
    renderWithProviders(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' }))
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true))
    expect(useAuthStore.getState().user?.email).toBe('jane@example.com')
  })

  it('shows an error message when credentials are wrong', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))
    renderWithProviders(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  it('requires matching passwords', async () => {
    renderWithProviders(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/First name/), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/Last name/), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText(/Confirm password/), { target: { value: 'different' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('registers a new user and signs them in', async () => {
    vi.mocked(authService.register).mockResolvedValue(tokens)
    renderWithProviders(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/First name/), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/Last name/), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText(/Confirm password/), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() =>
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Jane', email: 'jane@example.com' }),
      ),
    )
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true))
  })
})
