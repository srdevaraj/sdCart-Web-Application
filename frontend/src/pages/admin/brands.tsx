import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  ArrowRight,
  Check,
  CircleDot,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { Reveal } from '@/components/common/reveal'
import { useBrands } from '@/features/products/hooks'
import {
  useCreateBrand,
  useDeleteBrand,
  useUpdateBrand,
} from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { BrandResponse } from '@/types'

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(120).optional(),
  description: z.string().optional(),
  logoUrl: z.string().max(500).optional(),
  active: z.boolean(),
})

type BrandFormValues = z.infer<typeof brandSchema>

export default function AdminBrandsPage() {
  const brandsQuery = useBrands()
  const deleteBrand = useDeleteBrand()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BrandResponse | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(brand: BrandResponse) {
    setEditing(brand)
    setDialogOpen(true)
  }

  const brands = brandsQuery.data ?? []

  const activeBrands = brands.filter((brand) => brand.active).length
  const inactiveBrands = brands.length - activeBrands

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      {/* ================================================================
          HEADER
      ================================================================= */}
      <Reveal>
        <header className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.045] via-transparent to-transparent" />
          </div>

          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Catalog management
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Brand library
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Manage the brands displayed across your sdCart catalog and
                keep your storefront identity consistent.
              </p>
            </div>

            <Button
              onClick={openCreate}
              size="lg"
              className="group shrink-0 rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add brand
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </header>
      </Reveal>

      {/* ================================================================
          OVERVIEW
      ================================================================= */}
      {!brandsQuery.isPending && !brandsQuery.isError && (
        <Reveal delay={70}>
          <div className="grid gap-4 sm:grid-cols-3">
            <OverviewCard
              icon={Tags}
              label="Total brands"
              value={brands.length}
              description="Brands in your catalog"
            />

            <OverviewCard
              icon={Check}
              label="Active"
              value={activeBrands}
              description="Visible in the storefront"
              positive
            />

            <OverviewCard
              icon={CircleDot}
              label="Inactive"
              value={inactiveBrands}
              description="Currently hidden"
            />
          </div>
        </Reveal>
      )}

      {/* ================================================================
          CONTENT
      ================================================================= */}
      {brandsQuery.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-[230px] rounded-3xl"
            />
          ))}
        </div>
      ) : brandsQuery.isError ? (
        <ErrorState
          onRetry={() => brandsQuery.refetch()}
          message="We couldn't load brands."
        />
      ) : brands.length === 0 ? (
        <Reveal delay={100}>
          <div className="rounded-3xl border bg-card p-8 shadow-sm sm:p-12">
            <EmptyState
              icon={Tags}
              title="No brands yet"
              description="Create your first brand to start organizing your catalog."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Add brand
                </Button>
              }
            />
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand, index) => (
            <Reveal
              key={brand.publicId}
              delay={100 + index * 45}
            >
              <BrandCard
                brand={brand}
                onEdit={() => openEdit(brand)}
                onDelete={async () => {
                  await deleteBrand.mutateAsync(brand.publicId, {
                    onError: (error) =>
                      toast.error(
                        getErrorMessage(
                          error,
                          'Could not delete brand',
                        ),
                      ),
                  })

                  toast.success('Brand deleted')
                }}
              />
            </Reveal>
          ))}
        </div>
      )}

      {/* ================================================================
          BRAND DIALOG
      ================================================================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-xl">
          <DialogHeader className="border-b bg-gradient-to-br from-primary/[0.045] to-transparent px-6 py-6 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {editing ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </div>

              <div>
                <DialogTitle className="text-xl">
                  {editing ? 'Edit brand' : 'Create a brand'}
                </DialogTitle>

                <DialogDescription className="mt-1 leading-5">
                  {editing
                    ? `Update the details for ${editing.name}.`
                    : 'Add a new brand to your storefront catalog.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
            <BrandForm
              key={editing?.publicId ?? 'new'}
              brand={editing ?? undefined}
              onSuccess={() => setDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ==========================================================================
   OVERVIEW CARD
============================================================================= */

function OverviewCard({
  icon: Icon,
  label,
  value,
  description,
  positive = false,
}: {
  icon: typeof Tags
  label: string
  value: number
  description: string
  positive?: boolean
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-xl',
            positive
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-primary/10 text-primary',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   BRAND CARD
============================================================================= */

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: BrandResponse
  onEdit: () => void
  onDelete: () => Promise<void>
}) {
  const initial = brand.name.charAt(0).toUpperCase()

  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/7 blur-3xl transition-transform duration-700 group-hover:scale-125" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="relative flex h-full flex-col p-5">
        {/* Top section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Brand logo / initial */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-primary/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

              {brand.logoUrl ? (
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border bg-background shadow-sm">
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 font-display text-lg font-bold text-primary shadow-sm transition-transform duration-500 group-hover:scale-105">
                  {initial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-semibold tracking-tight">
                  {brand.name}
                </h2>

                <span
                  className={[
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    brand.active
                      ? 'bg-emerald-500'
                      : 'bg-muted-foreground/30',
                  ].join(' ')}
                  aria-hidden
                />
              </div>

              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                /{brand.slug}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label={`Edit ${brand.name}`}
              className="rounded-lg"
            >
              <Pencil />
            </Button>

            <ConfirmDialog
              title="Delete brand?"
              description={`${brand.name} will be permanently deleted.`}
              confirmLabel="Delete"
              destructive
              onConfirm={onDelete}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${brand.name}`}
                  className="rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              }
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 flex items-center justify-between">
          <div
            className={[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
              brand.active
                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600'
                : 'border-border bg-muted/50 text-muted-foreground',
            ].join(' ')}
          >
            <span
              className={[
                'h-1.5 w-1.5 rounded-full',
                brand.active
                  ? 'bg-emerald-500'
                  : 'bg-muted-foreground/40',
              ].join(' ')}
            />

            {brand.active ? 'Active' : 'Inactive'}
          </div>

          {brand.logoUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              Logo configured
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-4 flex-1">
          {brand.description ? (
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {brand.description}
            </p>
          ) : (
            <p className="text-sm italic leading-6 text-muted-foreground/50">
              No description added.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Catalog brand
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="group/edit -mr-2 rounded-lg text-xs text-primary"
          >
            Edit
            <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover/edit:translate-x-0.5 group-hover/edit:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   BRAND FORM
============================================================================= */

function BrandForm({
  brand,
  onSuccess,
}: {
  brand?: BrandResponse
  onSuccess: () => void
}) {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()

  const isSubmitting =
    createBrand.isPending || updateBrand.isPending

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name ?? '',
      slug: brand?.slug ?? '',
      description: brand?.description ?? '',
      logoUrl: brand?.logoUrl ?? '',
      active: brand?.active ?? true,
    },
  })

  async function onSubmit(values: BrandFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      logoUrl: values.logoUrl || undefined,
      active: values.active,
    }

    try {
      if (brand) {
        await updateBrand.mutateAsync({
          publicId: brand.publicId,
          payload,
        })

        toast.success('Brand updated')
      } else {
        await createBrand.mutateAsync(payload)

        toast.success('Brand created')
      }

      onSuccess()
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Could not save brand'),
      )
    }
  }

  const active = watch('active')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Name */}
      <FormField
        label="Brand name"
        error={errors.name?.message}
        required
      >
        <Input
          {...register('name')}
          placeholder="e.g. Nike"
          className="h-11 rounded-xl"
        />
      </FormField>

      {/* Slug */}
      <FormField
        label="Slug"
        error={errors.slug?.message}
        hint="Optional — automatically generated from the name if left blank."
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
            /
          </span>

          <Input
            {...register('slug')}
            placeholder="nike"
            className="h-11 rounded-xl pl-7"
          />
        </div>
      </FormField>

      {/* Description */}
      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          rows={4}
          {...register('description')}
          placeholder="Tell customers a little about this brand..."
          className="resize-none rounded-xl"
        />
      </FormField>

      {/* Logo */}
      <FormField
        label="Logo URL"
        error={errors.logoUrl?.message}
        hint="Use a publicly accessible image URL."
      >
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            {...register('logoUrl')}
            placeholder="https://example.com/logo.png"
            className="h-11 rounded-xl pl-10"
          />
        </div>
      </FormField>

      {/* Active status */}
      <div className="rounded-2xl border bg-muted/20 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-xl',
                active
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              <CircleDot className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Store visibility
              </p>

              <p className="text-xs text-muted-foreground">
                {active
                  ? 'This brand is visible in the storefront.'
                  : 'This brand is hidden from the storefront.'}
              </p>
            </div>
          </div>

          <Checkbox
            checked={active}
            onCheckedChange={(checked) =>
              setValue('active', checked === true)
            }
            aria-label="Brand active status"
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="group rounded-xl px-6"
        >
          {isSubmitting ? (
            <Spinner />
          ) : (
            <>
              {brand ? 'Save changes' : 'Create brand'}

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}