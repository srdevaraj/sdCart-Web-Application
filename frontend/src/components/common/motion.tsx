import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  type Variants,
} from 'framer-motion'

/* ================================================================
   MOTION REVEAL
   Drop-in upgrade for <Reveal>. Uses Framer Motion whileInView
   with spring physics and stagger support.
================================================================ */

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

interface MotionRevealProps {
  children: ReactNode
  /** Stagger delay in seconds (e.g., 0.06 for 60ms). */
  delay?: number
  className?: string
  /** Animation origin direction. */
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function MotionReveal({
  children,
  delay = 0,
  className,
  direction = 'up',
}: MotionRevealProps) {
  const prefersReduced = useReducedMotion()

  const directionMap = {
    up: { hidden: { y: 24 }, visible: { y: 0 } },
    down: { hidden: { y: -24 }, visible: { y: 0 } },
    left: { hidden: { x: 24 }, visible: { x: 0 } },
    right: { hidden: { x: -24 }, visible: { x: 0 } },
  }

  const dir = directionMap[direction]

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...dir.hidden }}
      whileInView={{ opacity: 1, ...dir.visible }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/* ================================================================
   PAGE TRANSITION
   Wraps children with AnimatePresence-compatible fade + slide.
   Use inside layout components around <Outlet />.
================================================================ */

interface PageTransitionProps {
  children: ReactNode
  /** Unique key for route-based transitions (use location.pathname). */
  transitionKey: string
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/* ================================================================
   MAGNETIC HOVER
   Makes children subtly follow the cursor on hover with spring
   physics. Great for primary CTAs and important interactive elements.
================================================================ */

interface MagneticHoverProps {
  children: ReactNode
  /** Strength of the magnetic pull (default 0.3 = 30% of offset). */
  strength?: number
  className?: string
}

export function MagneticHover({
  children,
  strength = 0.3,
  className,
}: MagneticHoverProps) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

/* ================================================================
   STAGGER CONTAINER
   Used as a parent to automatically stagger MotionReveal children.
================================================================ */

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={staggerItemVariants}>
      {children}
    </motion.div>
  )
}
