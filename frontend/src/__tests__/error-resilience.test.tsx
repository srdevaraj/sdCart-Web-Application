import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  isChunkLoadError,
  isOfflineError,
  categorizeError,
  shouldAutoReloadForChunkError,
  markChunkErrorReloadAttempted,
  clearChunkErrorReloadFlag,
} from '@/utils/error-utils'
import { ErrorFallbackView } from '@/components/common/error-fallback-view'
import { RouteErrorBoundary, RootErrorBoundary } from '@/components/common/error-boundary'

describe('Error resilience detection and loop protection utilities', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  describe('isChunkLoadError', () => {
    it('detects standard Vite/Chromium dynamic import failure', () => {
      const error = new Error(
        'Failed to fetch dynamically imported module: https://sdcart-demo-frontend-37mc.onrender.com/assets/order-detail-Be4lcTwi.js',
      )
      expect(isChunkLoadError(error)).toBe(true)
    })

    it('detects Firefox dynamic import error', () => {
      const error = new Error('error loading dynamically imported module')
      expect(isChunkLoadError(error)).toBe(true)
    })

    it('detects Safari / WebKit module script import error', () => {
      const error = new Error('Importing a module script failed.')
      expect(isChunkLoadError(error)).toBe(true)
    })

    it('detects Webpack / Rollup chunk error and named ChunkLoadError', () => {
      const chunkErr = new Error('Loading chunk 402 failed')
      expect(isChunkLoadError(chunkErr)).toBe(true)

      const namedErr = new Error('Random message')
      namedErr.name = 'ChunkLoadError'
      expect(isChunkLoadError(namedErr)).toBe(true)
    })

    it('returns false for generic errors', () => {
      expect(isChunkLoadError(new Error('Cannot read property of undefined'))).toBe(false)
      expect(isChunkLoadError(null)).toBe(false)
      expect(isChunkLoadError('Network timeout')).toBe(false)
    })
  })

  describe('isOfflineError', () => {
    it('returns true when navigator.onLine is false', () => {
      const originalOnLine = navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      expect(isOfflineError(new Error('Any error'))).toBe(true)

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    })

    it('returns true for network failure errors', () => {
      expect(isOfflineError(new Error('Failed to fetch'))).toBe(true)
      expect(isOfflineError(new Error('NetworkError when attempting to fetch resource.'))).toBe(true)
      expect(isOfflineError(new Error('net::ERR_INTERNET_DISCONNECTED'))).toBe(true)
    })

    it('returns false for normal application errors', () => {
      const originalOnLine = navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

      expect(isOfflineError(new Error('Validation failed'))).toBe(false)

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    })
  })

  describe('categorizeError', () => {
    it('prioritizes chunk errors', () => {
      const error = new Error('Failed to fetch dynamically imported module: /assets/test.js')
      expect(categorizeError(error)).toBe('chunk')
    })

    it('identifies offline errors', () => {
      const originalOnLine = navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      const error = new Error('Cannot load resource')
      expect(categorizeError(error)).toBe('offline')

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    })

    it('falls back to generic error', () => {
      const originalOnLine = navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

      expect(categorizeError(new Error('Cannot read property id of null'))).toBe('generic')

      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    })
  })

  describe('Chunk auto-reload loop protection', () => {
    it('allows initial auto-reload attempt and blocks subsequent immediate loops', () => {
      expect(shouldAutoReloadForChunkError()).toBe(true)

      markChunkErrorReloadAttempted()

      // Second attempt immediately afterwards should be blocked
      expect(shouldAutoReloadForChunkError()).toBe(false)

      // Clearing flag on successful navigation restores reload ability
      clearChunkErrorReloadFlag()
      expect(shouldAutoReloadForChunkError()).toBe(true)
    })
  })
})

describe('ErrorFallbackView component', () => {
  it('renders chunk error view with New Version Available and manual reload button', () => {
    const onReload = vi.fn()
    const onGoHome = vi.fn()

    render(
      <ErrorFallbackView
        category="chunk"
        error={new Error('Failed to fetch dynamically imported module: /chunk.js')}
        onReload={onReload}
        onGoHome={onGoHome}
      />,
    )

    expect(screen.getByText('New Version Available')).toBeInTheDocument()
    expect(screen.getByText(/A new build of sdCart has been deployed/i)).toBeInTheDocument()

    const reloadBtn = screen.getByRole('button', { name: /Reload Application/i })
    fireEvent.click(reloadBtn)
    expect(onReload).toHaveBeenCalledTimes(1)

    const homeBtn = screen.getByRole('button', { name: /Go to Home/i })
    fireEvent.click(homeBtn)
    expect(onGoHome).toHaveBeenCalledTimes(1)
  })

  it('renders updating state when auto-reloading', () => {
    render(
      <ErrorFallbackView
        category="chunk"
        isAutoReloading={true}
        error={new Error('Failed to fetch dynamically imported module')}
      />,
    )

    expect(screen.getByText('Updating sdCart…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reloading…/i })).toBeDisabled()
  })

  it('renders offline view with You\'re Offline message and auto-reconnects on online event', () => {
    const onReload = vi.fn()

    render(
      <ErrorFallbackView
        category="offline"
        error={new Error('net::ERR_INTERNET_DISCONNECTED')}
        onReload={onReload}
      />,
    )

    expect(screen.getByText("You're Offline")).toBeInTheDocument()
    expect(screen.getByText(/We couldn't connect to the internet/i)).toBeInTheDocument()

    // Trigger online event to test auto-retry
    window.dispatchEvent(new Event('online'))
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it('renders generic fallback view with Something Went Wrong and safe subtext', () => {
    const onReload = vi.fn()
    const onGoHome = vi.fn()

    render(
      <ErrorFallbackView
        category="generic"
        error={new Error('Unexpected invariant violation: item is null')}
        onReload={onReload}
        onGoHome={onGoHome}
      />,
    )

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(screen.getByText(/Your data and cart remain safe/i)).toBeInTheDocument()

    // Verify raw error text is not directly shown in the main text body
    expect(screen.queryByText(/Unexpected invariant violation/)).not.toBeInTheDocument()

    const reloadBtn = screen.getByRole('button', { name: /Reload Page/i })
    fireEvent.click(reloadBtn)
    expect(onReload).toHaveBeenCalledTimes(1)

    const homeBtn = screen.getByRole('button', { name: /Go to Home/i })
    fireEvent.click(homeBtn)
    expect(onGoHome).toHaveBeenCalledTimes(1)
  })
})

describe('RootErrorBoundary component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function BuggyComponent({ message = 'Crash!' }: { message?: string }): null {
    throw new Error(message)
  }

  it('catches render errors and displays fallback view instead of crashing app', () => {
    render(
      <RootErrorBoundary>
        <BuggyComponent message="Database connect failed" />
      </RootErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
  })

  it('catches dynamic chunk load errors and shows New Version screen', () => {
    render(
      <RootErrorBoundary>
        <BuggyComponent message="Failed to fetch dynamically imported module: /assets/admin.js" />
      </RootErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    // It should render chunk fallback view
    expect(
      screen.getByText(/Updating sdCart…|New Version Available/i),
    ).toBeInTheDocument()
  })

  it('renders RouteErrorBoundary with explicit error prop', () => {
    render(
      <RouteErrorBoundary error={new Error('Custom route error')} />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
  })
})
