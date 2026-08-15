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

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true })
Object.defineProperty(globalThis, 'scrollTo', { value: scrollToMock, writable: true })

afterEach(() => {
  cleanup()
  // Reset persisted auth between tests.
  localStorage.clear()
})
