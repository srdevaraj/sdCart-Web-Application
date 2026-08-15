import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/features/auth/auth-layout'

/**
 * The backend has no self-service reset endpoint; a reset link cannot be
 * validated here. Direct customers to support instead of faking a flow.
 */
export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset your password" description="Secure password reset">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
          <ShieldAlert className="h-6 w-6 text-warning" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">
          Password resets are handled securely by our support team. Please{' '}
          <a href="mailto:support@sdcart.com" className="font-medium text-primary hover:underline">
            contact support
          </a>{' '}
          and include the reset link you received.
        </p>
        <Button asChild variant="outline" className="w-full">
          <a href="mailto:support@sdcart.com">Contact support</a>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
