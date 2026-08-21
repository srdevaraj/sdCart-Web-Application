import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardSectionProps {
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Reusable container wrapper for Admin Dashboard sections.
 * Enforces consistent section headers, padding, spacing, and subtle card container elevation.
 */
export function DashboardSection({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7 transition-all duration-300 hover:border-primary/20 hover:shadow-md',
        className,
      )}
    >
      {/* Section Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Section Content */}
      <div>{children}</div>
    </section>
  )
}
