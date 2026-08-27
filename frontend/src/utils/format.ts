/** Pure formatting helpers shared across the app. */

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** Initials avatar text, e.g. "Jane Doe" -> "JD". */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** Simple pluralize helper. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

/**
 * Returns the number of whole calendar days elapsed from `dateLeft` to `dateRight`.
 * Mirrors the date-fns `differenceInCalendarDays(dateRight, dateLeft)` signature
 * so it can be trivially replaced if the project ever adds date-fns.
 *
 * @example
 *   differenceInCalendarDays(new Date(), new Date('2024-01-01')) // days since Jan 1
 */
export function differenceInCalendarDays(laterDate: Date, earlierDate: Date): number {
  // Strip time component by working in UTC day boundaries.
  const msPerDay = 86_400_000
  const later = Date.UTC(laterDate.getFullYear(), laterDate.getMonth(), laterDate.getDate())
  const earlier = Date.UTC(earlierDate.getFullYear(), earlierDate.getMonth(), earlierDate.getDate())
  return Math.floor((later - earlier) / msPerDay)
}
