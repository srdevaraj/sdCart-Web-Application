import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { useAuthStore } from '@/features/auth/auth-store'
import { authService } from '@/services/auth'
import { getErrorMessage } from '@/lib/api-client'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'

export function RegisterForm() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    try {
      const tokens = await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      })
      setTokens(tokens)
      toast.success('Account created — welcome to sdCart!')
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="reg-first" error={errors.firstName?.message} required>
          <Input id="reg-first" autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} {...register('firstName')} />
        </FormField>
        <FormField label="Last name" htmlFor="reg-last" error={errors.lastName?.message} required>
          <Input id="reg-last" autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} {...register('lastName')} />
        </FormField>
      </div>
      <FormField label="Email" htmlFor="reg-email" error={errors.email?.message} required>
        <Input id="reg-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
      </FormField>
      <FormField label="Phone" htmlFor="reg-phone" error={errors.phone?.message} hint="Optional — used for order updates">
        <Input id="reg-phone" type="tel" autoComplete="tel" {...register('phone')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Password" htmlFor="reg-password" error={errors.password?.message} required>
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="reg-confirm" error={errors.confirmPassword?.message} required>
          <Input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner /> Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  )
}
