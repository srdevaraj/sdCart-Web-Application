import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/public-layout'
import { CustomerLayout } from '@/components/layout/customer-layout'
import { AdminLayout } from '@/components/layout/admin-layout'
import { RequireAdmin, RequireAuth } from '@/components/layout/require-auth'
import { LoadingState } from '@/components/common/loading-state'
import { ProductsLoadingSkeleton } from '@/pages/products-loading'

// Route-level code splitting: each page is loaded only when first visited.
const HomePage = lazy(() => import('@/pages/home'))
const ProductsPage = lazy(() => import('@/pages/products'))
const ProductDetailPage = lazy(() => import('@/pages/product-detail'))
const CategoriesPage = lazy(() => import('@/pages/categories'))
const LoginPage = lazy(() => import('@/pages/login'))
const RegisterPage = lazy(() => import('@/pages/register'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'))
const CartPage = lazy(() => import('@/pages/cart'))
const CheckoutPage = lazy(() => import('@/pages/checkout'))
const OrderConfirmationPage = lazy(() => import('@/pages/order-confirmation'))
const AboutPage = lazy(() => import('@/pages/about'))
const ContactPage = lazy(() => import('@/pages/contact'))
const TermsPage = lazy(() => import('@/pages/terms'))
const PrivacyPage = lazy(() => import('@/pages/privacy'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

const ProfilePage = lazy(() => import('@/pages/account/profile'))
const OrdersPage = lazy(() => import('@/pages/account/orders'))
const OrderDetailPage = lazy(() => import('@/pages/account/order-detail'))
const AddressesPage = lazy(() => import('@/pages/account/addresses'))
const WishlistPage = lazy(() => import('@/pages/account/wishlist'))
const MyReviewsPage = lazy(() => import('@/pages/account/reviews'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard'))
const AdminProductsPage = lazy(() => import('@/pages/admin/products'))
const AdminInventoryPage = lazy(() => import('@/pages/admin/inventory'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories'))
const AdminBrandsPage = lazy(() => import('@/pages/admin/brands'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/orders'))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/payments'))
const AdminCouponsPage = lazy(() => import('@/pages/admin/coupons'))
const AdminUsersPage = lazy(() => import('@/pages/admin/users'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings'))

function withSuspense(node: React.ReactNode, fallback?: React.ReactNode) {
  return <Suspense fallback={fallback ?? <LoadingState label="Loading page…" />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      {
        path: 'products',
        element: withSuspense(<ProductsPage />, <ProductsLoadingSkeleton />),
      },
      // /search reuses the products listing driven by ?q=
      {
        path: 'search',
        element: withSuspense(<ProductsPage title="Search results" />, <ProductsLoadingSkeleton />),
      },
      { path: 'products/:publicId', element: withSuspense(<ProductDetailPage />) },
      { path: 'categories', element: withSuspense(<CategoriesPage />) },
      { path: 'about', element: withSuspense(<AboutPage />) },
      { path: 'contact', element: withSuspense(<ContactPage />) },
      { path: 'terms', element: withSuspense(<TermsPage />) },
      { path: 'privacy', element: withSuspense(<PrivacyPage />) },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'register', element: withSuspense(<RegisterPage />) },
      // /wishlist redirects into the authenticated account section
      { path: 'wishlist', element: <Navigate to="/account/wishlist" replace /> },
      { path: 'forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPasswordPage />) },
      {
        path: 'cart',
        element: withSuspense(
          <RequireAuth>
            <CartPage />
          </RequireAuth>,
        ),
      },
      {
        path: 'checkout',
        element: withSuspense(
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>,
        ),
      },
      {
        path: 'order-confirmation/:publicId',
        element: withSuspense(
          <RequireAuth>
            <OrderConfirmationPage />
          </RequireAuth>,
        ),
      },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: 'account',
    element: (
      <RequireAuth>
        <CustomerLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/account/profile" replace /> },
      { path: 'profile', element: withSuspense(<ProfilePage />) },
      { path: 'orders', element: withSuspense(<OrdersPage />) },
      { path: 'orders/:publicId', element: withSuspense(<OrderDetailPage />) },
      { path: 'addresses', element: withSuspense(<AddressesPage />) },
      { path: 'wishlist', element: withSuspense(<WishlistPage />) },
      { path: 'reviews', element: withSuspense(<MyReviewsPage />) },
    ],
  },
  {
    path: 'admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: withSuspense(<AdminDashboardPage />) },
      { path: 'products', element: withSuspense(<AdminProductsPage />) },
      { path: 'inventory', element: withSuspense(<AdminInventoryPage />) },
      { path: 'categories', element: withSuspense(<AdminCategoriesPage />) },
      { path: 'brands', element: withSuspense(<AdminBrandsPage />) },
      { path: 'orders', element: withSuspense(<AdminOrdersPage />) },
      { path: 'payments', element: withSuspense(<AdminPaymentsPage />) },
      { path: 'coupons', element: withSuspense(<AdminCouponsPage />) },
      { path: 'users', element: withSuspense(<AdminUsersPage />) },
      { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
    ],
  },
])
