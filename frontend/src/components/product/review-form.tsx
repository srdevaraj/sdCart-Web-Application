import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import { RatingInput } from '@/components/common/rating-stars'
import { useCreateReview, useUpdateReview } from '@/features/reviews/hooks'
import { getErrorMessage } from '@/lib/api-client'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating'),
  title: z.string().max(150, 'Title must be at most 150 characters').optional(),
  comment: z.string().max(2000, 'Comment must be at most 2000 characters').optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  productId: string
  reviewPublicId?: string
  initialValues?: ReviewFormValues
  submitLabel?: string
  onCancel?: () => void
  onSuccess?: () => void
}

export function ReviewForm({
  productId,
  reviewPublicId,
  initialValues,
  submitLabel = 'Submit review',
  onCancel,
  onSuccess,
}: ReviewFormProps) {
  const createReview = useCreateReview(productId)
  const updateReview = useUpdateReview(productId)
  const isSubmitting = createReview.isPending || updateReview.isPending

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: initialValues?.rating ?? 0, title: initialValues?.title ?? '', comment: initialValues?.comment ?? '' },
  })

  async function onSubmit(values: ReviewFormValues) {
    try {
      if (reviewPublicId) {
        await updateReview.mutateAsync({
          reviewPublicId,
          payload: { rating: values.rating, title: values.title, comment: values.comment },
        })
        toast.success('Review updated')
      } else {
        await createReview.mutateAsync({ productId, rating: values.rating, title: values.title, comment: values.comment })
        toast.success('Thanks! Your review has been posted')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not submit review'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Your rating" error={errors.rating?.message} required>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <RatingInput value={field.value} onChange={field.onChange} disabled={isSubmitting} />
          )}
        />
      </FormField>
      <FormField label="Title" htmlFor="review-title" error={errors.title?.message} hint="Optional, e.g. 'Great value'">
        <Input id="review-title" placeholder="Summary of your experience" {...register('title')} />
      </FormField>
      <FormField label="Review" htmlFor="review-comment" error={errors.comment?.message} hint="Optional — up to 2000 characters">
        <Textarea id="review-comment" rows={4} placeholder="What did you like or dislike?" {...register('comment')} />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
