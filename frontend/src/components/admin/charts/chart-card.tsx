import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
  className?: string
  /** Extra content placed in the header to the right of the title */
  headerAction?: ReactNode
}

/**
 * Shared card wrapper for all three dashboard analytics charts.
 * Provides a consistent title / subtitle / skeleton / empty state so every
 * chart feels like part of the same design system.
 */
export function ChartCard({
  title,
  subtitle,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available yet.',
  children,
  className,
  headerAction,
}: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-none tracking-tight">{title}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {headerAction}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-4 pt-0">
        {isLoading ? (
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="flex-1 rounded-lg" style={{ minHeight: 200 }} />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
