import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/form-field'
import { AuthLayout } from '@/features/auth/auth-layout'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas'

/**
 * The backend does not expose a self-service password reset endpoint yet, so
 * this page collects the request and directs customers to support rather than
 * inventing an API call that would fail.
 */
export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  function onSubmit() {
    setSubmitted(true)
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="We'll help you get back into your account"
    >
      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">
            Self-service password reset isn't available yet. Please email our support team at{' '}
            <a href="mailto:support@sdcart.com" className="font-medium text-primary hover:underline">
              support@sdcart.com
            </a>{' '}
            with the email <span className="font-medium text-foreground">you entered</span> and we'll
            reset your password within one business day.
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href="mailto:support@sdcart.com">Email support</a>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message} required>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </FormField>
          <Button type="submit" className="w-full">
            Continue
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
