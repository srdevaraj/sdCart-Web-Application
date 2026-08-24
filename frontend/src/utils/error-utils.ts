/**
 * Error detection and resilience utilities for sdCart frontend.
 */

const CHUNK_RELOAD_STORAGE_KEY = 'sdcart_chunk_reload_attempted'
const CHUNK_RELOAD_EXPIRY_MS = 30_000 // Reset attempt flag after 30 seconds

/**
 * Detects if an error is caused by a failed dynamic import / stale chunk load after a deployment.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : (error as { message?: string })?.message || ''

  const name =
    error instanceof Error
      ? error.name
      : (error as { name?: string })?.name || ''

  if (name === 'ChunkLoadError') {
    return true
  }

  // Common browser and bundler patterns for chunk import failure
  const chunkErrorPatterns = [
    /Failed to fetch dynamically imported module/i,
    /error loading dynamically imported module/i,
    /Importing a module script failed/i,
    /Loading chunk [^\s]+ failed/i,
    /Loading CSS chunk [^\s]+ failed/i,
    /Failed to load module script/i,
    /Unable to preload CSS/i,
  ]

  return chunkErrorPatterns.some((pattern) => pattern.test(message))
}

/**
 * Detects if an error is due to network offline / connectivity loss.
 */
export function isOfflineError(error: unknown): boolean {
  // Check browser online status first
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true
  }

  if (!error) return false

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : (error as { message?: string })?.message || ''

  const offlinePatterns = [
    /NetworkError/i,
    /Failed to fetch/i,
    /Network request failed/i,
    /net::ERR_INTERNET_DISCONNECTED/i,
    /net::ERR_CONNECTION_REFUSED/i,
    /The Internet connection appears to be offline/i,
  ]

  return offlinePatterns.some((pattern) => pattern.test(message))
}

export type ErrorCategory = 'chunk' | 'offline' | 'generic'

/**
 * Categorizes an error into chunk / offline / generic.
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (isChunkLoadError(error)) {
    return 'chunk'
  }
  if (isOfflineError(error)) {
    return 'offline'
  }
  return 'generic'
}

/**
 * Checks if an auto-reload can be attempted for chunk errors without infinite looping.
 * Returns true if this is the first attempt within the session threshold.
 */
export function shouldAutoReloadForChunkError(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false
  }

  try {
    const raw = window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)
    if (!raw) return true

    const timestamp = Number(raw)
    if (isNaN(timestamp)) return true

    // If the last attempt was longer ago than the threshold, allow a fresh attempt
    const elapsed = Date.now() - timestamp
    return elapsed > CHUNK_RELOAD_EXPIRY_MS
  } catch {
    return false
  }
}

/**
 * Records that a chunk reload attempt has been performed.
 */
export function markChunkErrorReloadAttempted(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()))
  } catch {
    // Ignore storage quota or disabled errors
  }
}

/**
 * Clears the chunk reload flag once the app has successfully mounted and rendered.
 */
export function clearChunkErrorReloadFlag(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return
  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}
