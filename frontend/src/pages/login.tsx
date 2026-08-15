import { Link } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/auth-layout'
import { LoginForm } from '@/features/auth/login-form'

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to continue shopping">
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to sdCart?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
