import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className,
  ariaLabel = 'Quantity',
}: QuantityInputProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div
      className={cn('inline-flex items-center rounded-md border border-input', disabled && 'opacity-50', className)}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10)
          if (Number.isNaN(next)) return
          onChange(clamp(next))
        }}
        onBlur={(e) => {
          const next = Number.parseInt(e.target.value, 10)
          if (!Number.isNaN(next)) onChange(clamp(next))
        }}
        className="h-9 w-12 border-x border-input bg-transparent text-center text-sm tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}
