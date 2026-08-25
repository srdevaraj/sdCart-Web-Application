import { memo } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useWishlistToggle } from '@/features/wishlist/hooks'
import { cn } from '@/lib/utils'

export interface WishlistButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string
  iconClassName?: string
}

export const WishlistButton = memo(function WishlistButton({
  productId,
  className,
  iconClassName,
  variant = 'ghost',
  size = 'icon-sm',
  ...props
}: WishlistButtonProps) {
  const { isWishlisted, isPending, toggleWishlist } = useWishlistToggle(productId)
  const prefersReduced = useReducedMotion()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist()
      }}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isWishlisted}
      aria-busy={isPending}
      className={cn('relative', className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isPending ? (
          <motion.span
            key="loading"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Loader2
              className={cn(
                'h-4 w-4 animate-spin text-muted-foreground',
                iconClassName,
              )}
              aria-hidden
            />
          </motion.span>
        ) : (
          <motion.span
            key={isWishlisted ? 'favorited' : 'unfavorited'}
            initial={prefersReduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isWishlisted && 'fill-destructive text-destructive',
                iconClassName,
              )}
              aria-hidden
            />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
})
