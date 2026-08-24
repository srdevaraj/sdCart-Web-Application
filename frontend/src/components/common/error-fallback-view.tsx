import { useState, useEffect, useCallback } from 'react'
import { Sparkles, WifiOff, AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import clogo from '../../../assets/clogo.png'
import type { ErrorCategory } from '@/utils/error-utils'

interface ErrorFallbackViewProps {
  category: ErrorCategory
  error?: unknown
  isAutoReloading?: boolean
  onReload?: () => void
  onGoHome?: () => void
}

export function ErrorFallbackView({
  category,
  error,
  isAutoReloading = false,
  onReload,
  onGoHome,
}: ErrorFallbackViewProps) {
  const [showDevDetails, setShowDevDetails] = useState(false)
  const isDev = import.meta.env.DEV

  const handleReload = useCallback(() => {
    if (onReload) {
      onReload()
    } else {
      window.location.reload()
    }
  }, [onReload])

  const handleGoHome = useCallback(() => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/'
    }
  }, [onGoHome])

  // Setup auto-reconnect listener for offline mode
  useEffect(() => {
    if (category !== 'offline') return

    const handleOnline = () => {
      handleReload()
    }

    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [category, handleReload])

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unknown error occurred.'

  const errorStack = error instanceof Error ? error.stack : undefined

  return (
    <div
      role="alert"
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 text-foreground"
    >
      {/* Background soft ambient radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-1/4 h-72 w-72 rounded-full bg-accent-warm/5 blur-3xl" />
      </div>

      {/* Main card container */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {/* Brand logo */}
        <div className="mb-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              handleGoHome()
            }}
            className="inline-flex shrink-0 items-center transition hover:opacity-90"
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
          </a>
        </div>

        {/* Dynamic Card */}
        <div className="w-full rounded-2xl border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-10">
          {category === 'chunk' && (
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                <Sparkles className="h-8 w-8 animate-pulse" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {isAutoReloading ? 'Updating sdCart…' : 'New Version Available'}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                {isAutoReloading
                  ? 'We are refreshing the application to apply the latest updates and improvements.'
                  : 'A new build of sdCart has been deployed. Please reload the page to continue seamlessly.'}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={handleReload}
                  disabled={isAutoReloading}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isAutoReloading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {isAutoReloading ? 'Reloading…' : 'Reload Application'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  disabled={isAutoReloading}
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {category === 'offline' && (
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
                <WifiOff className="h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                You're Offline
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                We couldn't connect to the internet. Please check your network connection and try again.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={handleReload} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {category === 'generic' && (
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
                <AlertTriangle className="h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Something Went Wrong
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                We encountered an unexpected issue while loading this page. Your data and cart remain safe.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={handleReload} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {/* Developer details accordion - STRICTLY in local DEV environment only */}
          {isDev && Boolean(error) && (
            <div className="mt-8 border-t border-border/60 pt-6 text-left">
              <button
                type="button"
                onClick={() => setShowDevDetails((prev) => !prev)}
                className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <span>Developer Diagnostic Details (DEV only)</span>
                {showDevDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDevDetails && (
                <div className="mt-3 overflow-hidden rounded-lg bg-muted/60 p-3 font-mono text-xs text-foreground">
                  <div className="font-semibold text-destructive">{errorMessage}</div>
                  {errorStack && (
                    <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                      {errorStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
