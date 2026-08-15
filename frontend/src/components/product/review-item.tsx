import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RatingStars } from '@/components/common/rating-stars'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ReviewForm } from '@/components/product/review-form'
import { useAuthStore } from '@/features/auth/auth-store'
import { useDeleteReview } from '@/features/reviews/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate } from '@/utils/format'
import { getInitials } from '@/utils/format'
import type { ReviewResponse } from '@/types'

interface ReviewItemProps {
  review: ReviewResponse
}

export function ReviewItem({ review }: ReviewItemProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.publicId === review.user.publicId
  const [editing, setEditing] = useState(false)

  const deleteReview = useDeleteReview(review.productId)

  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            aria-hidden
          >
            {getInitials(review.user.firstName, review.user.lastName)}
          </span>
          <div>
            <p className="text-sm font-medium">
              {isOwner ? `${review.user.firstName} ${review.user.lastName} (you)` : `${review.user.firstName} ${review.user.lastName}`}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <RatingStars value={review.rating} />
          {isOwner && !editing && (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Edit review">
                <Pencil />
              </Button>
              <ConfirmDialog
                title="Delete review?"
                description="This review will be permanently removed."
                confirmLabel="Delete"
                destructive
                onConfirm={async () => {
                  await deleteReview.mutateAsync(review.publicId, {
                    onError: (error) => toast.error(getErrorMessage(error, 'Could not delete review')),
                  })
                  toast.success('Review deleted')
                }}
                trigger={<Button variant="ghost" size="icon-sm" aria-label="Delete review"><Trash2 /></Button>}
              />
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 border-t pt-3">
          <ReviewForm
            productId={review.productId}
            initialValues={{ rating: review.rating, title: review.title ?? '', comment: review.comment ?? '' }}
            reviewPublicId={review.publicId}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSuccess={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          {review.title && <h4 className="mt-3 text-sm font-semibold">{review.title}</h4>}
          {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
        </>
      )}
    </article>
  )
}
