import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { useAuthStore } from '@/features/auth/auth-store'
import { authService } from '@/services/auth'
import { getErrorMessage } from '@/lib/api-client'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      const tokens = await authService.login(values)
      setTokens(tokens)
      toast.success(`Welcome back, ${tokens.user.firstName}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Sign in failed. Check your credentials.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <FormField label="Email" htmlFor="login-email" error={errors.email?.message} required>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>
      <FormField label="Password" htmlFor="login-password" error={errors.password?.message} required>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </FormField>
      <div className="flex items-center justify-end">
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
