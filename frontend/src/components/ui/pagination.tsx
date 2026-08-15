import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number // zero-based
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Server-side pagination controls (zero-based pages, matching the API). */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageWindow(page, totalPages)

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p + 1}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

function getPageWindow(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }
  const result: Array<number | 'ellipsis'> = [0]
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages - 2, page + 1)
  if (start > 1) result.push('ellipsis')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < totalPages - 2) result.push('ellipsis')
  result.push(totalPages - 1)
  return result
}
