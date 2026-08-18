import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  ArrowRight,
  Check,
  ChevronRight,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormField } from '@/components/common/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { Spinner } from '@/components/common/loading-state'
import { Reveal } from '@/components/common/reveal'
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
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(72),
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
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
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

        profileForm.reset({
          firstName: me.firstName,
          lastName: me.lastName,
          phone: me.phone ?? '',
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(error, 'Could not load your profile'),
          )
        }
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
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

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
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-[270px] rounded-[28px]" />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[460px] rounded-[28px]" />
          <Skeleton className="h-[460px] rounded-[28px]" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <ErrorState
        title="Could not load profile"
        message={loadError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : ''

  const initials = user
    ? getInitials(user.firstName, user.lastName)
    : ''

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================================
          PROFILE HERO
      ================================================================= */}
      <Reveal>
        <section className="group relative overflow-hidden rounded-[28px] border bg-card shadow-sm transition-all duration-500 hover:shadow-xl">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/[0.12] blur-3xl transition-transform duration-1000 group-hover:scale-125" />

            <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />

            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/[0.025] to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent" />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_auto]">
            {/* Main identity */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute -inset-3 rounded-full bg-primary/[0.08] opacity-0 blur-xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent opacity-70" />

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary/20 via-primary/10 to-background text-3xl font-bold text-primary shadow-lg transition-transform duration-500 group-hover:scale-[1.04] sm:h-28 sm:w-28 sm:text-4xl">
                    {initials}
                  </div>

                  <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-background bg-emerald-500 text-white shadow-md">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* User details */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Account
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {fullName}
                  </h1>

                  <div className="mt-3 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row">
                    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        {user?.email}
                      </span>
                    </span>

                    <span className="hidden text-muted-foreground/40 sm:block">
                      •
                    </span>

                    <span>
                      Member since{' '}
                      {user ? formatDate(user.createdAt) : ''}
                    </span>
                  </div>

                  <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:mx-0">
                    Keep your personal details current and your account
                    protected from one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Account information panel */}
            <div className="border-t bg-background/50 p-6 backdrop-blur-sm lg:w-[300px] lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Account security
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Password protected
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-5">
                  <p className="text-xs leading-5 text-muted-foreground">
                    Your account information is securely managed through
                    sdCart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================================================================
          SETTINGS GRID
      ================================================================= */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ================================================================
            PERSONAL INFORMATION
        ================================================================= */}
        <Reveal delay={100}>
          <Card className="group h-full overflow-hidden rounded-[28px] border shadow-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="border-b bg-gradient-to-br from-primary/[0.035] via-transparent to-transparent p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-lg">
                      Personal details
                    </CardTitle>

                    <CardDescription className="mt-1.5 max-w-md leading-5">
                      Update the information associated with your account.
                    </CardDescription>
                  </div>
                </div>

                <span className="hidden rounded-full border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:block">
                  Profile
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7">
              <form
                onSubmit={profileForm.handleSubmit(onSaveProfile)}
                className="grid gap-5 sm:grid-cols-2"
                noValidate
              >
                <FormField
                  label="First name"
                  htmlFor="pf-first"
                  error={profileForm.formState.errors.firstName?.message}
                  required
                >
                  <Input
                    id="pf-first"
                    autoComplete="given-name"
                    className="h-12 rounded-xl border-border/70 bg-background transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    {...profileForm.register('firstName')}
                  />
                </FormField>

                <FormField
                  label="Last name"
                  htmlFor="pf-last"
                  error={profileForm.formState.errors.lastName?.message}
                  required
                >
                  <Input
                    id="pf-last"
                    autoComplete="family-name"
                    className="h-12 rounded-xl border-border/70 bg-background transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    {...profileForm.register('lastName')}
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField
                    label="Phone number"
                    htmlFor="pf-phone"
                    error={profileForm.formState.errors.phone?.message}
                    hint="Optional"
                  >
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />

                      <Input
                        id="pf-phone"
                        type="tel"
                        autoComplete="tel"
                        className="h-12 rounded-xl border-border/70 bg-background pl-10 transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        {...profileForm.register('phone')}
                      />
                    </div>
                  </FormField>
                </div>

                <div className="mt-2 flex flex-col gap-4 border-t pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </div>

                    <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                      Changes are saved securely to your account.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="group/button h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {savingProfile ? (
                      <Spinner />
                    ) : (
                      <>
                        Save changes

                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Reveal>

        {/* ================================================================
            SECURITY
        ================================================================= */}
        <Reveal delay={160}>
          <Card className="group h-full overflow-hidden rounded-[28px] border shadow-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="border-b bg-gradient-to-br from-primary/[0.035] via-transparent to-transparent p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-lg">
                    Security
                  </CardTitle>

                  <CardDescription className="mt-1.5 leading-5">
                    Keep your account protected with a strong password.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-7">
              {/* Security banner */}
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Password protection
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Use at least 8 characters for a stronger password.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
                className="grid gap-5"
                noValidate
              >
                <FormField
                  label="Current password"
                  htmlFor="pw-current"
                  error={
                    passwordForm.formState.errors.currentPassword?.message
                  }
                  required
                >
                  <Input
                    id="pw-current"
                    type="password"
                    autoComplete="current-password"
                    className="h-12 rounded-xl border-border/70 bg-background transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    {...passwordForm.register('currentPassword')}
                  />
                </FormField>

                <FormField
                  label="New password"
                  htmlFor="pw-new"
                  error={
                    passwordForm.formState.errors.newPassword?.message
                  }
                  required
                >
                  <Input
                    id="pw-new"
                    type="password"
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border/70 bg-background transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    {...passwordForm.register('newPassword')}
                  />
                </FormField>

                <FormField
                  label="Confirm new password"
                  htmlFor="pw-confirm"
                  error={
                    passwordForm.formState.errors.confirmPassword?.message
                  }
                  required
                >
                  <Input
                    id="pw-confirm"
                    type="password"
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border/70 bg-background transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    {...passwordForm.register('confirmPassword')}
                  />
                </FormField>

                <div className="mt-1 border-t pt-5">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="group/button h-11 w-full rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {savingPassword ? (
                      <Spinner />
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />

                        Update password

                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* ================================================================
          BOTTOM ACCOUNT NOTE
      ================================================================= */}
      <Reveal delay={220}>
        <div className="group relative overflow-hidden rounded-2xl border bg-card/70 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary/60" />

          <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Account security is important
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your password changes are securely processed by sdCart.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Protected
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}