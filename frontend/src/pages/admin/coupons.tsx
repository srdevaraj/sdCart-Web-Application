import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminCoupons, useCreateCoupon, useSetCouponActive, useUpdateCoupon } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'
import type { CouponResponse, CouponType } from '@/types'

const couponSchema = z
  .object({
    code: z.string().min(1, 'Code is required').max(50).transform((v) => v.toUpperCase()),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.coerce.number({ message: 'Value must be a number' }).min(0.01, 'Value must be greater than zero'),
    minOrderAmount: z.coerce.number().min(0).optional().or(z.literal('')),
    maxDiscountAmount: z.coerce.number().min(0).optional().or(z.literal('')),
    maxUsages: z.coerce.number().int().min(0).optional(),
    perUserLimit: z.coerce.number().int().min(0).optional(),
    validFrom: z.string().min(1, 'Valid from is required'),
    validUntil: z.string().min(1, 'Valid until is required'),
    active: z.boolean(),
    description: z.string().max(255).optional(),
  })
  .refine((data) => !data.validFrom || !data.validUntil || new Date(data.validUntil) > new Date(data.validFrom), {
    message: 'Valid until must be after valid from',
    path: ['validUntil'],
  })

type CouponFormValues = z.infer<typeof couponSchema>

const toLocalInputValue = (iso: string | null | undefined) =>
  iso ? new Date(iso).toISOString().slice(0, 16) : ''

export default function AdminCouponsPage() {
  const [page, setPage] = useState(0)
  const couponsQuery = useAdminCoupons(page, 20)
  const setActive = useSetCouponActive()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CouponResponse | null>(null)

  const coupons = couponsQuery.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {coupons ? `${coupons.totalElements} coupons` : 'Promotions and discounts'}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add coupon
        </Button>
      </header>

      {couponsQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : couponsQuery.isError ? (
        <ErrorState onRetry={() => couponsQuery.refetch()} message="We couldn't load coupons." />
      ) : !coupons ? null : coupons.empty ? (
        <EmptyState
          icon={TicketPercent}
          title="No coupons yet"
          action={
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4" aria-hidden /> Create coupon
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Valid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.content.map((coupon) => (
                  <tr key={coupon.publicId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold">{coupon.code}</p>
                      {coupon.description && <p className="text-xs text-muted-foreground">{coupon.description}</p>}
                    </td>
                    <td className="px-4 py-3">{coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}%` : formatPrice(coupon.value)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.usedCount}/{coupon.maxUsages}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(coupon.validFrom)} → {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setActive.mutate(
                            { publicId: coupon.publicId, active: !coupon.active },
                            {
                              onSuccess: () => toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'}`),
                              onError: (error) => toast.error(getErrorMessage(error, 'Could not update coupon')),
                            },
                          )
                        }
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditing(coupon)
                            setDialogOpen(true)
                          }}
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDialog
                          title="Delete coupon?"
                          description={`${coupon.code} will be removed. Orders already using it keep their discount.`}
                          confirmLabel="Delete"
                          destructive
                          onConfirm={async () => {
                            await setActive.mutateAsync({ publicId: coupon.publicId, active: false })
                            toast.success('Coupon deactivated')
                          }}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${coupon.code}`}>
                              <Trash2 />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={coupons.page}
            totalPages={coupons.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit coupon' : 'Create coupon'}</DialogTitle>
            <DialogDescription>{editing ? `Editing "${editing.code}"` : 'Add a new promo code.'}</DialogDescription>
          </DialogHeader>
          <CouponForm
            key={editing?.publicId ?? 'new'}
            coupon={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CouponForm({ coupon, onSuccess }: { coupon?: CouponResponse; onSuccess: () => void }) {
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const isSubmitting = createCoupon.isPending || updateCoupon.isPending

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code ?? '',
      type: coupon?.type ?? 'PERCENTAGE',
      value: coupon ? Number(coupon.value) : 10,
      minOrderAmount: coupon?.minOrderAmount ? Number(coupon.minOrderAmount) : '',
      maxDiscountAmount: coupon?.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : '',
      maxUsages: coupon?.maxUsages ?? 100,
      perUserLimit: coupon?.perUserLimit ?? 1,
      validFrom: toLocalInputValue(coupon?.validFrom) || new Date().toISOString().slice(0, 16),
      validUntil: toLocalInputValue(coupon?.validUntil) || '',
      active: coupon?.active ?? true,
      description: coupon?.description ?? '',
    },
  })

  async function onSubmit(values: CouponFormValues) {
    const payload = {
      code: values.code,
      type: values.type as CouponType,
      value: values.value,
      minOrderAmount: values.minOrderAmount === '' ? undefined : values.minOrderAmount,
      maxDiscountAmount: values.maxDiscountAmount === '' ? undefined : values.maxDiscountAmount,
      maxUsages: values.maxUsages ?? 0,
      perUserLimit: values.perUserLimit ?? 0,
      validFrom: new Date(values.validFrom).toISOString(),
      validUntil: new Date(values.validUntil).toISOString(),
      active: values.active,
      description: values.description || undefined,
    }
    try {
      if (coupon) {
        await updateCoupon.mutateAsync({ publicId: coupon.publicId, payload })
        toast.success('Coupon updated')
      } else {
        await createCoupon.mutateAsync(payload)
        toast.success('Coupon created')
      }
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save coupon'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Code" error={errors.code?.message} required>
          <Input {...register('code')} placeholder="SAVE10" className="uppercase" />
        </FormField>
        <FormField label="Type" error={errors.type?.message} required>
          <Select value={watch('type')} onValueChange={(v) => setValue('type', v as CouponType)}>
            <SelectTrigger aria-label="Coupon type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={watch('type') === 'PERCENTAGE' ? 'Discount %' : 'Discount (₹)'} error={errors.value?.message} required>
          <Input type="number" step="0.01" min={0.01} {...register('value')} />
        </FormField>
        <FormField label="Min order amount (₹)" error={errors.minOrderAmount?.message}>
          <Input type="number" step="0.01" min={0} {...register('minOrderAmount')} />
        </FormField>
        <FormField label="Max discount (₹)" error={errors.maxDiscountAmount?.message} hint="Optional — for percentage coupons">
          <Input type="number" step="0.01" min={0} {...register('maxDiscountAmount')} />
        </FormField>
        <FormField label="Max usages" error={errors.maxUsages?.message}>
          <Input type="number" min={0} {...register('maxUsages')} />
        </FormField>
        <FormField label="Per-user limit" error={errors.perUserLimit?.message}>
          <Input type="number" min={0} {...register('perUserLimit')} />
        </FormField>
        <FormField label="Valid from" error={errors.validFrom?.message} required>
          <Input type="datetime-local" {...register('validFrom')} />
        </FormField>
        <FormField label="Valid until" error={errors.validUntil?.message} required>
          <Input type="datetime-local" {...register('validUntil')} />
        </FormField>
      </div>
      <FormField label="Description" error={errors.description?.message}>
        <Input {...register('description')} placeholder="e.g. 10% off first order over ₹50" />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={watch('active')} onCheckedChange={(checked) => setValue('active', checked === true)} />
        Active immediately
      </label>
      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : coupon ? 'Save changes' : 'Create coupon'}
        </Button>
      </div>
    </form>
  )
}
