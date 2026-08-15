import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { useCategories } from '@/features/products/hooks'
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { CategoryResponse } from '@/types'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(120).optional(),
  description: z.string().optional(),
  imageUrl: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  active: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function AdminCategoriesPage() {
  const categoriesQuery = useCategories(true)
  const deleteCategory = useDeleteCategory()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryResponse | null>(null)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your catalog into collections.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add category
        </Button>
      </header>

      {categoriesQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : categoriesQuery.isError ? (
        <ErrorState onRetry={() => categoriesQuery.refetch()} message="We couldn't load categories." />
      ) : categoriesQuery.data.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No categories yet"
          action={
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4" aria-hidden /> Add category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesQuery.data.map((category) => (
            <div key={category.publicId} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Boxes className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-semibold">{category.name}</h2>
                    <p className="text-xs text-muted-foreground">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(category)
                      setDialogOpen(true)
                    }}
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil />
                  </Button>
                  <ConfirmDialog
                    title="Delete category?"
                    description={`${category.name} will be permanently deleted.`}
                    confirmLabel="Delete"
                    destructive
                    onConfirm={async () => {
                      await deleteCategory.mutateAsync(category.publicId, {
                        onError: (error) => toast.error(getErrorMessage(error, 'Could not delete category')),
                      })
                      toast.success('Category deleted')
                    }}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${category.name}`}>
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </div>
              {category.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
              )}
              {category.children.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {category.children.length} sub-categor{category.children.length === 1 ? 'y' : 'ies'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit category' : 'Add category'}</DialogTitle>
            <DialogDescription>{editing ? `Editing "${editing.name}"` : 'Create a new category.'}</DialogDescription>
          </DialogHeader>
          <CategoryForm
            key={editing?.publicId ?? 'new'}
            category={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryForm({ category, onSuccess }: { category?: CategoryResponse; onSuccess: () => void }) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isSubmitting = createCategory.isPending || updateCategory.isPending

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? '',
      sortOrder: category?.sortOrder ?? 0,
      active: category?.active ?? true,
    },
  })

  async function onSubmit(values: CategoryFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      sortOrder: values.sortOrder,
      active: values.active,
    }
    try {
      if (category) {
        await updateCategory.mutateAsync({ publicId: category.publicId, payload })
        toast.success('Category updated')
      } else {
        await createCategory.mutateAsync(payload)
        toast.success('Category created')
      }
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save category'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" error={errors.name?.message} required>
        <Input {...register('name')} placeholder="Category name" />
      </FormField>
      <FormField label="Slug" error={errors.slug?.message} hint="Optional — auto-generated from name if blank">
        <Input {...register('slug')} placeholder="category-slug" />
      </FormField>
      <FormField label="Description" error={errors.description?.message}>
        <Textarea rows={2} {...register('description')} />
      </FormField>
      <FormField label="Image URL" error={errors.imageUrl?.message}>
        <Input {...register('imageUrl')} placeholder="https://…/category.jpg" />
      </FormField>
      <FormField label="Sort order" error={errors.sortOrder?.message}>
        <Input type="number" min={0} {...register('sortOrder')} />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={watch('active')} onCheckedChange={(checked) => setValue('active', checked === true)} />
        Active (visible in store)
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : category ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  )
}
