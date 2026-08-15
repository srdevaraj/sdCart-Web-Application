import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

export function RatingStars({ value, count, size = 'sm', className }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  const rounded = Math.round(value)
  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < rounded ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40',
            )}
          />
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  )
}

interface RatingInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function RatingInput({ value, onChange, disabled }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              star <= value ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40',
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}
