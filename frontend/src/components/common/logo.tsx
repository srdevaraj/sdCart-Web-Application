import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  linkTo?: string
}

export function Logo({ className, linkTo = '/' }: LogoProps) {
  return (
    <Link
      to={linkTo}
      className={cn('inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight', className)}
      aria-label="sdCart home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShoppingBag className="h-5 w-5" aria-hidden />
      </span>
      <span>
        sd<span className="text-primary">Cart</span>
      </span>
    </Link>
  )
}
