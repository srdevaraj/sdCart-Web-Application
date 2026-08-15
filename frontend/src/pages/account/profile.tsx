import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/common/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { Spinner } from '@/components/common/loading-state'
import { useAuthStore } from '@/features/auth/auth-store'
import { userService } from '@/services/users'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, getInitials } from '@/utils/format'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(30).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(72),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [loading, setLoading] = useState(!user)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (user) return
    let cancelled = false
    setLoading(true)
    userService
      .me()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        profileForm.reset({ firstName: me.firstName, lastName: me.lastName, phone: me.phone ?? '' })
      })
      .catch((error) => {
        if (!cancelled) setLoadError(getErrorMessage(error, 'Could not load your profile'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, setUser, profileForm])

  async function onSaveProfile(values: ProfileFormValues) {
    setSavingProfile(true)
    try {
      const updated = await userService.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      })
      setUser(updated)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update profile'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function onChangePassword(values: PasswordFormValues) {
    setSavingPassword(true)
    try {
      await userService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      passwordForm.reset()
      toast.success('Password changed')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not change password'))
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (loadError) {
    return <ErrorState title="Could not load profile" message={loadError} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and password.</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {user ? getInitials(user.firstName, user.lastName) : ''}
          </span>
          <div>
            <CardTitle>{user ? `${user.firstName} ${user.lastName}` : ''}</CardTitle>
            <CardDescription>{user?.email} · Member since {user ? formatDate(user.createdAt) : ''}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid max-w-lg gap-4 sm:grid-cols-2" noValidate>
            <FormField label="First name" htmlFor="pf-first" error={profileForm.formState.errors.firstName?.message} required>
              <Input id="pf-first" autoComplete="given-name" {...profileForm.register('firstName')} />
            </FormField>
            <FormField label="Last name" htmlFor="pf-last" error={profileForm.formState.errors.lastName?.message} required>
              <Input id="pf-last" autoComplete="family-name" {...profileForm.register('lastName')} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Phone" htmlFor="pf-phone" error={profileForm.formState.errors.phone?.message} hint="Optional">
                <Input id="pf-phone" type="tel" autoComplete="tel" {...profileForm.register('phone')} />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Spinner /> : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use at least 8 characters. You'll stay signed in on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid max-w-lg gap-4" noValidate>
            <FormField
              label="Current password"
              htmlFor="pw-current"
              error={passwordForm.formState.errors.currentPassword?.message}
              required
            >
              <Input id="pw-current" type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="New password"
                htmlFor="pw-new"
                error={passwordForm.formState.errors.newPassword?.message}
                required
              >
                <Input id="pw-new" type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
              </FormField>
              <FormField
                label="Confirm new password"
                htmlFor="pw-confirm"
                error={passwordForm.formState.errors.confirmPassword?.message}
                required
              >
                <Input id="pw-confirm" type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
              </FormField>
            </div>
            <div>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? <Spinner /> : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
