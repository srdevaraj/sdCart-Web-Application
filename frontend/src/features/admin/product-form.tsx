import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { ProductImage } from '@/components/common/product-image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBrands, useCategories } from '@/features/products/hooks'
import { useCreateProduct, useUpdateProduct } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { PRODUCT_STATUSES, type ProductResponse, type ProductStatus } from '@/types'

/**
 * Image rows accept a local file (uploaded to Cloudinary via the backend) and
 * an optional alt text. When editing, `imageUrl` carries the existing image
 * for display; the row is only sent as an upload when a new `file` is chosen.
 */
const imageSchema = z.object({
  file: z.instanceof(File).optional(),
  imageUrl: z.string().max(500).optional(),
  altText: z.string().max(255).optional(),
})

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().max(255).optional(),
  sku: z.string().max(100).optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z.coerce.number({ message: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  costPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  stockQuantity: z.coerce.number({ message: 'Stock must be a number' }).min(0, 'Stock cannot be negative'),
  status: z.enum(PRODUCT_STATUSES as [ProductStatus, ...ProductStatus[]]),
  featured: z.boolean(),
  categoryId: z.string().optional().or(z.literal('')),
  brandId: z.string().optional().or(z.literal('')),
  images: z.array(imageSchema),
  specifications: z.array(z.object({ name: z.string().max(100), value: z.string().max(500) })),
})

type ProductFormValues = z.infer<typeof productSchema>

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif'

interface ProductFormProps {
  product?: ProductResponse
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const categories = useCategories(false)
  const brands = useBrands()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isSubmitting = createProduct.isPending || updateProduct.isPending

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          sku: product.sku ?? '',
          shortDescription: product.shortDescription ?? '',
          description: product.description ?? '',
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : '',
          costPrice: '',
          stockQuantity: product.stockQuantity,
          status: product.status,
          featured: product.featured,
          categoryId: product.category?.publicId ?? '',
          brandId: product.brand?.publicId ?? '',
          images: product.images.map((img) => ({ imageUrl: img.imageUrl, altText: img.altText ?? '' })),
          specifications: product.specifications.map((s) => ({ name: s.name, value: s.value })),
        }
      : {
          name: '',
          slug: '',
          sku: '',
          shortDescription: '',
          description: '',
          price: 0,
          compareAtPrice: '',
          costPrice: '',
          stockQuantity: 0,
          status: 'ACTIVE',
          featured: false,
          categoryId: '',
          brandId: '',
          images: [{ altText: '' }],
          specifications: [{ name: '', value: '' }],
        },
  })

  const images = useFieldArray({ control, name: 'images' })
  const specs = useFieldArray({ control, name: 'specifications' })
  const featured = watch('featured')

  async function onSubmit(values: ProductFormValues) {
    const imageRows = values.images.filter(
      (img) => img.file instanceof File || (img.imageUrl ?? '').trim().length > 0,
    )
    const files = imageRows
      .map((img) => (img.file instanceof File ? img.file : null))
      .filter((file): file is File => file !== null)
    const altTexts = imageRows.map((img) => img.altText?.trim() ?? '')

    // Creating a product still requires at least one image (same as before).
    if (!product && files.length === 0) {
      toast.error('Select at least one image file')
      return
    }

    const basePayload = {
      name: values.name,
      slug: values.slug || undefined,
      sku: values.sku || undefined,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      price: values.price,
      compareAtPrice: values.compareAtPrice === '' ? undefined : values.compareAtPrice,
      costPrice: values.costPrice === '' ? undefined : values.costPrice,
      stockQuantity: values.stockQuantity,
      status: values.status,
      featured: values.featured,
      categoryId: values.categoryId || undefined,
      brandId: values.brandId || undefined,
      specifications: values.specifications
        .filter((s) => s.name.trim().length > 0 && s.value.trim().length > 0)
        .map((s, i) => ({ name: s.name.trim(), value: s.value.trim(), sortOrder: i })),
    }

    try {
      if (product) {
        if (files.length > 0) {
          // Replacement image(s) — sent as multipart; the backend uploads them
          // to Cloudinary and removes the replaced assets after saving.
          await updateProduct.mutateAsync({ publicId: product.publicId, payload: basePayload, files, altTexts })
        } else {
          // No new image — keep the existing images (URL-based JSON, unchanged).
          await updateProduct.mutateAsync({
            publicId: product.publicId,
            payload: {
              ...basePayload,
              images: imageRows
                .filter((img) => (img.imageUrl ?? '').trim().length > 0)
                .map((img, i) => ({
                  imageUrl: (img.imageUrl as string).trim(),
                  altText: img.altText || undefined,
                  sortOrder: i,
                  primary: i === 0,
                })),
            },
          })
        }
        toast.success('Product updated')
      } else {
        await createProduct.mutateAsync({ payload: basePayload, files, altTexts })
        toast.success('Product created')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save product'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-5 overflow-y-auto pr-1" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Name" error={errors.name?.message} required>
            <Input {...register('name')} placeholder="Product name" />
          </FormField>
        </div>
        <FormField label="Slug" error={errors.slug?.message} hint="Optional — auto-generated from name if blank">
          <Input {...register('slug')} placeholder="my-product-slug" />
        </FormField>
        <FormField label="SKU" error={errors.sku?.message}>
          <Input {...register('sku')} placeholder="SKU-001" />
        </FormField>
        <FormField label="Price ($)" error={errors.price?.message} required>
          <Input type="number" step="0.01" min={0} {...register('price')} />
        </FormField>
        <FormField label="Compare-at price ($)" error={errors.compareAtPrice?.message} hint="Original price for sale display">
          <Input type="number" step="0.01" min={0} {...register('compareAtPrice')} />
        </FormField>
        <FormField label="Stock quantity" error={errors.stockQuantity?.message} required>
          <Input type="number" min={0} {...register('stockQuantity')} />
        </FormField>
        <FormField label="Status" error={errors.status?.message} required>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v as ProductStatus)}>
            <SelectTrigger aria-label="Product status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Category">
          <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categories.data?.map((c) => (
                <SelectItem key={c.publicId} value={c.publicId}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Brand">
          <Select value={watch('brandId')} onValueChange={(v) => setValue('brandId', v)}>
            <SelectTrigger aria-label="Brand">
              <SelectValue placeholder="No brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {brands.data?.map((b) => (
                <SelectItem key={b.publicId} value={b.publicId}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={featured} onCheckedChange={(checked) => setValue('featured', checked === true)} />
            Featured product
          </label>
        </div>
      </div>

      <FormField label="Short description" error={errors.shortDescription?.message}>
        <Textarea rows={2} {...register('shortDescription')} placeholder="One or two sentence summary" />
      </FormField>
      <FormField label="Full description" error={errors.description?.message}>
        <Textarea rows={4} {...register('description')} placeholder="Detailed product description" />
      </FormField>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Images</p>
        {images.fields.map((field, i) => (
          <div key={field.id} className="space-y-2 rounded-lg border bg-card p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex items-center gap-2">
                {field.imageUrl ? (
                  <ProductImage src={field.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md" />
                ) : null}
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  aria-label={`Image ${i + 1} file`}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setValue(`images.${i}.file`, file ?? undefined)
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <Input {...register(`images.${i}.altText`)} placeholder="Alt text" aria-label={`Image ${i + 1} alt text`} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => images.remove(i)}
                disabled={images.fields.length <= 1}
                aria-label={`Remove image ${i + 1}`}
              >
                <Trash2 />
              </Button>
            </div>
            {field.imageUrl ? (
              <p className="text-xs text-muted-foreground">
                Current image — choose a file above to replace it.
              </p>
            ) : null}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => images.append({ altText: '' })}>
          <Plus className="h-4 w-4" aria-hidden /> Add image
        </Button>
        <p className="text-xs text-muted-foreground">
          Images are uploaded securely to Cloudinary. The first image is used as the product thumbnail.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Specifications</p>
        {specs.fields.map((field, i) => (
          <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input {...register(`specifications.${i}.name`)} placeholder="Name (e.g. Material)" aria-label={`Specification ${i + 1} name`} />
            <Input {...register(`specifications.${i}.value`)} placeholder="Value (e.g. Cotton)" aria-label={`Specification ${i + 1} value`} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => specs.remove(i)}
              aria-label={`Remove specification ${i + 1}`}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => specs.append({ name: '', value: '' })}>
          <Plus className="h-4 w-4" aria-hidden /> Add specification
        </Button>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : product ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
