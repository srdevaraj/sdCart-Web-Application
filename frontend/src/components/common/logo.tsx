import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import clogo from '../../../assets/clogo.png'

interface LogoProps {
  className?: string
  linkTo?: string
}

export function Logo({ className, linkTo = '/' }: LogoProps) {
  return (
    <Link
      to={linkTo}
      className={cn('inline-flex shrink-0 items-center', className)}
      aria-label="sdCart home"
    >
      <img
        src={clogo}
        alt="sdCart"
        width={1024}
        height={1024}
        draggable={false}
        className="h-12 w-12 object-contain"
      />
    </Link>
  )
}
