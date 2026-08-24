import { Component, type ErrorInfo, type ReactNode, useEffect, useState, useRef } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import {
  categorizeError,
  shouldAutoReloadForChunkError,
  markChunkErrorReloadAttempted,
} from '@/utils/error-utils'
import { ErrorFallbackView } from '@/components/common/error-fallback-view'

interface RouteErrorBoundaryProps {
  error?: unknown
}

/**
 * Route-level error boundary component for React Router 7.
 * Replaces React Router's default developer error screen with on-brand UX.
 */
export function RouteErrorBoundary({ error: propError }: RouteErrorBoundaryProps) {
  let routerError: unknown = null
  try {
    // Attempt to read router error if rendered inside a router context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    routerError = useRouteError()
  } catch {
    // Not in router context
  }

  const activeError = propError ?? routerError

  // Normalize route error response if applicable
  const errorToProcess = isRouteErrorResponse(activeError)
    ? new Error(`${activeError.status} ${activeError.statusText}: ${activeError.data}`)
    : activeError

  const category = categorizeError(errorToProcess)
  const [isAutoReloading, setIsAutoReloading] = useState(false)
  const autoReloadTriggered = useRef(false)

  useEffect(() => {
    // Always log the caught error for debugging
    console.error('[RouteErrorBoundary caught error]:', activeError)

    // Handle chunk load auto-reload with loop protection
    if (category === 'chunk' && !autoReloadTriggered.current) {
      if (shouldAutoReloadForChunkError()) {
        autoReloadTriggered.current = true
        setIsAutoReloading(true)
        markChunkErrorReloadAttempted()

        // Short timeout to allow the user to see the "Updating..." state before reload
        const timer = setTimeout(() => {
          window.location.reload()
        }, 600)

        return () => clearTimeout(timer)
      }
    }
  }, [activeError, category])

  return (
    <ErrorFallbackView
      category={category}
      error={errorToProcess}
      isAutoReloading={isAutoReloading}
    />
  )
}

interface RootErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface RootErrorBoundaryState {
  hasError: boolean
  error: unknown
}

/**
 * Top-level React Error Boundary for the root application tree.
 */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary caught unhandled error]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <RouteErrorBoundary error={this.state.error} />
    }

    return this.props.children
  }
}
