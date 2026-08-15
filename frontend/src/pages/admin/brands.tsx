import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { useBrands } from '@/features/products/hooks'
import { useCreateBrand, useDeleteBrand, useUpdateBrand } from '@/features/admin/hooks'
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">Brands shown across the catalog.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add brand
        </Button>
      </header>

      {brandsQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : brandsQuery.isError ? (
        <ErrorState onRetry={() => brandsQuery.refetch()} message="We couldn't load brands." />
      ) : brandsQuery.data.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No brands yet"
          action={
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4" aria-hidden /> Add brand
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandsQuery.data.map((brand) => (
            <div key={brand.publicId} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-display font-bold text-primary">
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold">{brand.name}</h2>
                    <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(brand)
                      setDialogOpen(true)
                    }}
                    aria-label={`Edit ${brand.name}`}
                  >
                    <Pencil />
                  </Button>
                  <ConfirmDialog
                    title="Delete brand?"
                    description={`${brand.name} will be permanently deleted.`}
                    confirmLabel="Delete"
                    destructive
                    onConfirm={async () => {
                      await deleteBrand.mutateAsync(brand.publicId, {
                        onError: (error) => toast.error(getErrorMessage(error, 'Could not delete brand')),
                      })
                      toast.success('Brand deleted')
                    }}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${brand.name}`}>
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </div>
              {brand.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit brand' : 'Add brand'}</DialogTitle>
            <DialogDescription>{editing ? `Editing "${editing.name}"` : 'Create a new brand.'}</DialogDescription>
          </DialogHeader>
          <BrandForm
            key={editing?.publicId ?? 'new'}
            brand={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BrandForm({ brand, onSuccess }: { brand?: BrandResponse; onSuccess: () => void }) {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const isSubmitting = createBrand.isPending || updateBrand.isPending

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
        await updateBrand.mutateAsync({ publicId: brand.publicId, payload })
        toast.success('Brand updated')
      } else {
        await createBrand.mutateAsync(payload)
        toast.success('Brand created')
      }
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save brand'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" error={errors.name?.message} required>
        <Input {...register('name')} placeholder="Brand name" />
      </FormField>
      <FormField label="Slug" error={errors.slug?.message} hint="Optional — auto-generated from name if blank">
        <Input {...register('slug')} placeholder="brand-slug" />
      </FormField>
      <FormField label="Description" error={errors.description?.message}>
        <Textarea rows={2} {...register('description')} />
      </FormField>
      <FormField label="Logo URL" error={errors.logoUrl?.message}>
        <Input {...register('logoUrl')} placeholder="https://…/logo.png" />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={watch('active')} onCheckedChange={(checked) => setValue('active', checked === true)} />
        Active (visible in store)
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : brand ? 'Save changes' : 'Create brand'}
        </Button>
      </div>
    </form>
  )
}
