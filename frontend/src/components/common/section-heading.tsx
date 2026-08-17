import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  viewAllTo?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div className={cn(centered ? 'mx-auto max-w-2xl text-center' : 'flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        )}
        <h2 className={cn('mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl', centered && 'text-balance')}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn('mt-2 text-sm text-muted-foreground sm:text-base', centered && 'mx-auto max-w-xl text-balance')}>
            {subtitle}
          </p>
        )}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className={cn(
            'group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80',
            centered && 'mt-4',
          )}
        >
          View all
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  )
}
