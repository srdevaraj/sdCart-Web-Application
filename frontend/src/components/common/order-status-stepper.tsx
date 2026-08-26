import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Package,
  Receipt,
  Truck,
} from 'lucide-react'
import { type OrderStatus } from '@/types'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/lib/utils'

interface OrderStatusStepperProps {
  status: OrderStatus
  createdAt: string
  updatedAt: string
  className?: string
}

/** Happy-path ranked progression */
const HAPPY_PATH_STEPS: Array<{
  id: OrderStatus
  label: string
  description: string
  icon: typeof Receipt
}> = [
  {
    id: 'PENDING',
    label: 'Order Placed',
    description: 'Order received',
    icon: Receipt,
  },
  {
    id: 'CONFIRMED',
    label: 'Confirmed',
    description: 'Processing items',
    icon: Package,
  },
  {
    id: 'SHIPPED',
    label: 'Shipped',
    description: 'In transit',
    icon: Truck,
  },
  {
    id: 'DELIVERED',
    label: 'Delivered',
    description: 'Package delivered',
    icon: CheckCircle2,
  },
]

const RANK_MAP: Record<OrderStatus, number> = {
  PENDING: 0,
  AWAITING_PAYMENT: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
  PAYMENT_FAILED: -1,
}

export function OrderStatusStepper({
  status,
  createdAt,
  updatedAt,
  className,
}: OrderStatusStepperProps) {
  const currentRank = RANK_MAP[status] ?? 0
  const isCancelled = status === 'CANCELLED'
  const isPaymentFailed = status === 'PAYMENT_FAILED'

  // If payment failed, render a dedicated status banner
  if (isPaymentFailed) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-5 shadow-sm sm:p-6',
          className,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-destructive">Payment Failed</h3>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Action Required
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The payment attempt for this order was not completed. Please retry payment to confirm your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If order is cancelled, render a dedicated terminal status banner
  if (isCancelled) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-5 shadow-sm sm:p-6',
          className,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-destructive">Order Cancelled</h3>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Terminal State
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                This order was cancelled on {formatDateTime(updatedAt)}. Reserved stock has been released.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate progress bar percentage (0%, 33.3%, 66.6%, 100%)
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentRank / (HAPPY_PATH_STEPS.length - 1)) * 100),
  )

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Order Progress Tracking
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {HAPPY_PATH_STEPS.find((s) => s.id === status)?.label ?? status}
        </span>
      </div>

      {/* Stepper bar + indicators */}
      <div className="relative px-2 py-3 sm:px-6">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-8 h-1 -translate-y-1/2 bg-muted sm:left-12 sm:right-12" />

        {/* Animated fill progress line */}
        <div
          className="absolute left-8 top-8 h-1 -translate-y-1/2 bg-primary transition-all duration-500 ease-out sm:left-12"
          style={{
            width: `calc(${progressPercent}% * (100% - 4rem) / 100)`,
          }}
        />

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {HAPPY_PATH_STEPS.map((step, index) => {
            const isCompleted = index < currentRank
            const isActive = index === currentRank
            const StepIcon = step.icon

            // Determine timestamp to display
            let timestampLabel: string | null = null
            if (index === 0) {
              timestampLabel = formatDateTime(createdAt)
            } else if (isActive) {
              timestampLabel = formatDateTime(updatedAt)
            }

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                {/* Indicator circle */}
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground shadow-sm',
                    isActive &&
                      'border-primary bg-background text-primary ring-4 ring-primary/20 shadow-md',
                    !isCompleted &&
                      !isActive &&
                      'border-muted-foreground/30 bg-muted/60 text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <StepIcon
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        isActive && 'animate-pulse text-primary',
                      )}
                    />
                  )}

                  {/* Active step glow dot */}
                  {isActive && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                    </span>
                  )}
                </div>

                {/* Step labels */}
                <div className="mt-3 max-w-[80px] sm:max-w-[120px]">
                  <p
                    className={cn(
                      'text-xs font-semibold tracking-tight sm:text-sm',
                      isActive && 'text-primary font-bold',
                      isCompleted && 'text-foreground font-medium',
                      !isCompleted && !isActive && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>

                  <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
                    {step.description}
                  </p>

                  {timestampLabel && (
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                      {timestampLabel}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
