import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './chart-card'
import { useOrderStatusSummary } from '@/features/admin/hooks'
import type { StatusCount } from '@/types'

// ---------------------------------------------------------------------------
// 4-bucket grouping
// PENDING + AWAITING_PAYMENT + CONFIRMED + SHIPPED → "Pending" (In Progress)
// DELIVERED → "Delivered"
// CANCELLED + PAYMENT_FAILED → "Cancelled"
// REFUND_REQUESTED + REFUNDED → "Product Refund"
// ---------------------------------------------------------------------------

const IN_PROGRESS_STATUSES = new Set(['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'SHIPPED'])
const CANCELLED_STATUSES = new Set(['CANCELLED', 'PAYMENT_FAILED'])
const REFUND_STATUSES = new Set(['REFUND_REQUESTED', 'REFUNDED'])

interface Bucket {
  label: string
  count: number
  fill: string
}

function buildBuckets(data: StatusCount[]): Bucket[] {
  let delivered = 0
  let inProgress = 0
  let cancelled = 0
  let productRefund = 0

  for (const d of data) {
    if (d.status === 'DELIVERED') {
      delivered += d.count
    } else if (REFUND_STATUSES.has(d.status)) {
      productRefund += d.count
    } else if (IN_PROGRESS_STATUSES.has(d.status)) {
      inProgress += d.count
    } else if (CANCELLED_STATUSES.has(d.status)) {
      cancelled += d.count
    }
  }

  return [
    { label: 'Delivered', count: delivered, fill: 'hsl(152, 55%, 38%)' },       // --success (teal-green)
    { label: 'Pending', count: inProgress, fill: 'hsl(35, 92%, 45%)' },        // --warning (amber)
    { label: 'Cancelled', count: cancelled, fill: 'hsl(0, 72%, 51%)' },         // --destructive (red)
    { label: 'Product Refund', count: productRefund, fill: 'hsl(262, 80%, 56%)' }, // indigo/purple (matches payment refund & badge)
  ]
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function OrderTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: Bucket }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-pop text-xs">
      <p className="font-semibold text-foreground">{d.label}</p>
      <p className="text-muted-foreground">
        Orders: <span className="font-semibold text-foreground">{d.count.toLocaleString()}</span>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Order status horizontal bar chart.
 * Visually distinct from both the revenue (vertical bars) and payment (donut) charts.
 * Uses the 4-bucket mapping: Delivered / Pending / Cancelled / Product Refund.
 *
 * Colors:
 *  - Delivered      → --success      (teal-green)
 *  - Pending        → --warning      (amber)
 *  - Cancelled      → --destructive  (red)
 *  - Product Refund → purple/indigo  (hsl(262, 80%, 56%))
 */
export function OrderStatusChart() {
  const { data, isPending, isError } = useOrderStatusSummary()

  const total = (data ?? []).reduce((s, d) => s + d.count, 0)
  const hasData = total > 0
  const buckets = data ? buildBuckets(data) : []

  return (
    <ChartCard
      title="Order status"
      subtitle="All-time breakdown"
      isLoading={isPending}
      isEmpty={!isPending && !isError && !hasData}
      emptyMessage="No orders placed yet."
    >
      {isError && (
        <p className="py-4 text-center text-sm text-destructive">Failed to load order data.</p>
      )}
      {hasData && (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              layout="vertical"
              data={buckets}
              margin={{ top: 4, right: 32, left: 4, bottom: 4 }}
              barSize={20}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'hsl(240, 4%, 42%)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(240, 10%, 8%)', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<OrderTooltip />} cursor={{ fill: 'hsl(240,6%,90%,0.4)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {buckets.map((b) => (
                  <Cell
                    key={b.label}
                    fill={b.fill}
                    className="transition-opacity duration-150 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend / totals row */}
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {buckets.map((b) => (
              <li key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.fill }}
                />
                {b.label}
                <span className="font-medium text-foreground">{b.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  )
}
