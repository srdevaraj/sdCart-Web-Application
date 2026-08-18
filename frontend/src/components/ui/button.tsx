import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-xl text-sm font-semibold',
    'transition-all duration-300 ease-out',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none',
    '[&_svg]:size-4',
    '[&_svg]:shrink-0',
    '[&_svg]:transition-transform',
    '[&_svg]:duration-300',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'shadow-sm',
          'hover:-translate-y-0.5',
          'hover:bg-primary/90',
          'hover:shadow-md',
          'active:translate-y-0',
          'active:shadow-sm',
        ].join(' '),

        destructive: [
          'bg-destructive text-destructive-foreground',
          'shadow-sm',
          'hover:-translate-y-0.5',
          'hover:bg-destructive/90',
          'hover:shadow-md',
          'active:translate-y-0',
        ].join(' '),

        outline: [
          'border border-border/80',
          'bg-background/80',
          'text-foreground',
          'shadow-sm',
          'backdrop-blur-sm',
          'hover:-translate-y-0.5',
          'hover:border-primary/30',
          'hover:bg-primary/[0.035]',
          'hover:text-primary',
          'hover:shadow-md',
          'active:translate-y-0',
        ].join(' '),

        secondary: [
          'border border-border/50',
          'bg-secondary text-secondary-foreground',
          'shadow-sm',
          'hover:-translate-y-0.5',
          'hover:bg-secondary/80',
          'hover:shadow-md',
          'active:translate-y-0',
        ].join(' '),

        ghost: [
          'bg-transparent',
          'text-muted-foreground',
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'hover:-translate-y-px',
        ].join(' '),

        link: [
          'h-auto rounded-md',
          'p-0',
          'text-primary',
          'font-medium',
          'underline-offset-4',
          'hover:underline',
          'hover:text-primary/80',
        ].join(' '),
      },

      size: {
        default: [
          'h-10',
          'px-4',
          'py-2',
        ].join(' '),

        sm: [
          'h-9',
          'rounded-lg',
          'px-3.5',
          'text-xs',
        ].join(' '),

        lg: [
          'h-12',
          'rounded-xl',
          'px-7',
          'text-sm',
        ].join(' '),

        icon: [
          'h-10',
          'w-10',
          'rounded-xl',
          'p-0',
        ].join(' '),

        'icon-sm': [
          'h-9',
          'w-9',
          'rounded-lg',
          'p-0',
        ].join(' '),
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }