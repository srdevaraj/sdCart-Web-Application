import { Link } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/auth-layout'
import { RegisterForm } from '@/features/auth/register-form'

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" description="Join sdCart for faster checkout and order tracking">
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
