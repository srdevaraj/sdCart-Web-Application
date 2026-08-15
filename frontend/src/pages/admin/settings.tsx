import { Link } from 'react-router-dom'
import { Globe, Info, Mail, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth/auth-store'
import { formatDate } from '@/utils/format'

/**
 * Store settings overview. The backend exposes no settings API, so this page
 * documents the store configuration and the signed-in administrator.
 */
export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store configuration and account overview.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Globe className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <CardTitle>Store configuration</CardTitle>
              <CardDescription>Managed via environment variables on the backend.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SettingRow label="Store name" value="sdCart" />
            <SettingRow label="Currency" value="USD ($)" />
            <SettingRow label="Free shipping threshold" value="$50.00" />
            <SettingRow label="Flat shipping fee" value="$5.00 (below threshold)" />
            <SettingRow label="Sales tax" value="0% (configurable)" />
            <SettingRow label="Payment gateway" value="Mock (Stripe-ready)" />
            <SettingRow label="Email provider" value="Console (SMTP-ready)" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              <div>
                <CardTitle>Signed in as</CardTitle>
                <CardDescription>Your administrator account.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {user ? (
                <>
                  <SettingRow label="Name" value={`${user.firstName} ${user.lastName}`} />
                  <SettingRow label="Email" value={user.email} />
                  <SettingRow label="Roles" value={user.roles.join(', ')} />
                  <SettingRow label="Member since" value={formatDate(user.createdAt)} />
                </>
              ) : (
                <p className="text-muted-foreground">Not signed in.</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to="/account/profile" className="text-sm font-medium text-primary hover:underline">
                  Edit profile
                </Link>
                <span aria-hidden>·</span>
                <Link to="/account/orders" className="text-sm font-medium text-primary hover:underline">
                  View orders
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Info className="h-5 w-5 text-primary" aria-hidden />
              <div>
                <CardTitle>Tips</CardTitle>
                <CardDescription>Quick references for this demo environment.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Demo admin login: <span className="font-mono">admin@sdcart.com</span></p>
              <p>• Order status transitions: PENDING → CONFIRMED → SHIPPED → DELIVERED</p>
              <p>• Test coupon codes: <span className="font-mono">WELCOME10</span>, <span className="font-mono">SAVE20</span></p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden /> For production help, see the backend README.
              </p>
              <p className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" aria-hidden /> Manage products, orders, coupons and more from the menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
