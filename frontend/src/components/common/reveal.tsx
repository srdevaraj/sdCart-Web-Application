import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Observes an element and reports once it has entered the viewport.
 * Skips observation entirely for users who prefer reduced motion
 * (content is simply shown immediately).
 */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms (used to sequence sibling cards/sections). */
  delay?: number
  className?: string
}

/**
 * Reveals its children with a subtle fade + rise when scrolled into view.
 * Animates transform/opacity only; honors prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(20px)',
        transition: `opacity 650ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: inView ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
