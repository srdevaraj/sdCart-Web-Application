import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { useCreateAddress, useUpdateAddress } from '@/features/addresses/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { AddressResponse } from '@/types'

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50, 'Label is too long'),
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(30),
  line1: z.string().min(1, 'Address line 1 is required').max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1, 'Country is required').max(100),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  address?: AddressResponse
  onSuccess?: () => void
  submitLabel?: string
}

export function AddressForm({ address, onSuccess, submitLabel = 'Save address' }: AddressFormProps) {
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const isSubmitting = createAddress.isPending || updateAddress.isPending
  const [isDefault, setIsDefault] = useState(!address)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? '',
          city: address.city,
          state: address.state ?? '',
          postalCode: address.postalCode ?? '',
          country: address.country,
        }
      : {
          label: 'Home',
          recipientName: '',
          phone: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
  })

  async function onSubmit(values: AddressFormValues) {
    const payload = {
      ...values,
      line2: values.line2 || undefined,
      state: values.state || undefined,
      postalCode: values.postalCode || undefined,
    }
    try {
      if (address) {
        await updateAddress.mutateAsync({ publicId: address.publicId, payload })
        toast.success('Address updated')
      } else {
        await createAddress.mutateAsync({ ...payload, isDefault })
        toast.success('Address added')
        reset()
      }
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save address'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <FormField label="Label" htmlFor="addr-label" error={errors.label?.message} hint="e.g. Home, Work" required>
        <Input id="addr-label" {...register('label')} />
      </FormField>
      <FormField label="Recipient name" htmlFor="addr-name" error={errors.recipientName?.message} required>
        <Input id="addr-name" autoComplete="name" {...register('recipientName')} />
      </FormField>
      <FormField label="Phone" htmlFor="addr-phone" error={errors.phone?.message} required>
        <Input id="addr-phone" type="tel" autoComplete="tel" {...register('phone')} />
      </FormField>
      <FormField label="Country" htmlFor="addr-country" error={errors.country?.message} required>
        <Input id="addr-country" autoComplete="country-name" {...register('country')} />
      </FormField>
      <div className="sm:col-span-2">
        <FormField label="Address line 1" htmlFor="addr-line1" error={errors.line1?.message} required>
          <Input id="addr-line1" autoComplete="address-line1" placeholder="Street address, P.O. box" {...register('line1')} />
        </FormField>
      </div>
      <div className="sm:col-span-2">
        <FormField label="Address line 2" htmlFor="addr-line2" error={errors.line2?.message} hint="Apartment, suite, unit (optional)">
          <Input id="addr-line2" autoComplete="address-line2" {...register('line2')} />
        </FormField>
      </div>
      <FormField label="City" htmlFor="addr-city" error={errors.city?.message} required>
        <Input id="addr-city" autoComplete="address-level2" {...register('city')} />
      </FormField>
      <FormField label="State / Province" htmlFor="addr-state" error={errors.state?.message}>
        <Input id="addr-state" autoComplete="address-level1" {...register('state')} />
      </FormField>
      <FormField label="Postal code" htmlFor="addr-zip" error={errors.postalCode?.message}>
        <Input id="addr-zip" autoComplete="postal-code" {...register('postalCode')} />
      </FormField>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isDefault}
            disabled={Boolean(address)}
            onCheckedChange={(checked) => setIsDefault(checked === true)}
            aria-disabled={Boolean(address)}
          />
          Set as default
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : submitLabel}
        </Button>
      </div>
    </form>
  )
}
