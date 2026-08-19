import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom does not implement ResizeObserver (used by Radix + sonner).
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom does not implement scrollTo on window/elements.
const scrollToMock = vi.fn()

// jsdom does not implement IntersectionObserver (used by Framer Motion + scroll reveals).
class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  callback: IntersectionObserverCallback | undefined

  constructor(callback?: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback?.(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
}

Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true })
Object.defineProperty(globalThis, 'scrollTo', { value: scrollToMock, writable: true })

afterEach(() => {
  cleanup()
  // Reset persisted auth between tests.
  localStorage.clear()
})
