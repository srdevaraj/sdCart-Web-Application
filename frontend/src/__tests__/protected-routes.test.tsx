import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@/test/utils'
import { RequireAdmin, RequireAuth } from '@/components/layout/require-auth'
import { useAuthStore } from '@/features/auth/auth-store'
import type { UserResponse } from '@/types'

const user: UserResponse = {
  publicId: 'u-1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: null,
  roles: ['USER'],
  active: true,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

const adminUser: UserResponse = { ...user, roles: ['ADMIN', 'USER'] }

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('redirects signed-out users to /login', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Secret page</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>,
      { route: '/protected' },
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret page')).not.toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    useAuthStore.setState({
      accessToken: 'a',
      refreshToken: 'r',
      user,
      isAuthenticated: true,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Secret page</div>
            </RequireAuth>
          }
        />
      </Routes>,
      { route: '/protected' },
    )

    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })
})

describe('RequireAdmin', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('redirects non-admin users away from admin routes', () => {
    useAuthStore.setState({ accessToken: 'a', refreshToken: 'r', user, isAuthenticated: true })

    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <div>Admin dashboard</div>
            </RequireAdmin>
          }
        />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>,
      { route: '/admin' },
    )

    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('Admin dashboard')).not.toBeInTheDocument()
  })

  it('renders the admin area for users with the ADMIN role', () => {
    useAuthStore.setState({ accessToken: 'a', refreshToken: 'r', user: adminUser, isAuthenticated: true })

    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <div>Admin dashboard</div>
            </RequireAdmin>
          }
        />
      </Routes>,
      { route: '/admin' },
    )

    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
  })
})
