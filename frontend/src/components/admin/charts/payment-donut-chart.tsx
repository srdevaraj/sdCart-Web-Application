import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard } from './chart-card'
import { usePaymentStatusSummary } from '@/features/admin/hooks'
import type { StatusCount } from '@/types'

// ---------------------------------------------------------------------------
// Color palette — one deliberate color per PaymentStatus
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'hsl(152, 55%, 38%)',  // --success (teal-green)
  PENDING: 'hsl(35, 92%, 45%)',     // --warning (amber)
  FAILED: 'hsl(0, 72%, 51%)',       // --destructive (red)
  REFUNDED: 'hsl(262, 80%, 56%)',    // indigo/purple
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function PaymentTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: StatusCount }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-pop text-xs">
      <p className="font-semibold text-foreground">{STATUS_LABELS[d.status] ?? d.status}</p>
      <p className="text-muted-foreground">
        Count: <span className="font-semibold text-foreground">{d.count.toLocaleString()}</span>
      </p>
      <p className="text-muted-foreground">
        Share: <span className="font-semibold text-foreground">{d.percentage.toFixed(1)}%</span>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Custom legend
// ---------------------------------------------------------------------------

function PaymentLegend({ data }: { data: StatusCount[] }) {
  return (
    <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {data
        .filter((d) => d.count > 0)
        .map((d) => (
          <li key={d.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: STATUS_COLORS[d.status] ?? 'hsl(240,5%,65%)' }}
            />
            {STATUS_LABELS[d.status] ?? d.status}
            <span className="font-medium text-foreground">{d.count.toLocaleString()}</span>
          </li>
        ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Center label rendered inside the donut hole
// ---------------------------------------------------------------------------

function CenterLabel({
  cx,
  cy,
  total,
}: {
  cx?: number
  cy?: number
  total: number
}) {
  return (
    <g>
      <text
        x={cx}
        y={(cy ?? 0) - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display"
        style={{ fontSize: 22, fontWeight: 700, fill: 'hsl(240, 10%, 8%)' }}
      >
        {total.toLocaleString()}
      </text>
      <text
        x={cx}
        y={(cy ?? 0) + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 10, fill: 'hsl(240, 4%, 42%)' }}
      >
        total payments
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Payment status donut chart.
 * Shows PENDING / COMPLETED / FAILED / REFUNDED as distinct donut segments.
 * Segments with count = 0 are omitted from the donut (zero-width slice).
 * Center label shows total payment count.
 */
export function PaymentDonutChart() {
  const { data, isPending, isError } = usePaymentStatusSummary()

  const total = (data ?? []).reduce((s, d) => s + d.count, 0)
  const hasData = total > 0
  const chartData = (data ?? []).filter((d) => d.count > 0)

  return (
    <ChartCard
      title="Payment status"
      subtitle="All-time breakdown"
      isLoading={isPending}
      isEmpty={!isPending && !isError && !hasData}
      emptyMessage="No payments processed yet."
    >
      {isError && (
        <p className="py-4 text-center text-sm text-destructive">Failed to load payment data.</p>
      )}
      {hasData && (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="80%"
                dataKey="count"
                paddingAngle={3}
                strokeWidth={0}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? 'hsl(240,5%,65%)'}
                    className="transition-opacity duration-150 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Pie
                data={[{ value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={0}
                dataKey="value"
                label={({ cx, cy }) => <CenterLabel cx={cx} cy={cy} total={total} />}
                labelLine={false}
                fill="none"
                strokeWidth={0}
              />
              <Tooltip content={<PaymentTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {data && <PaymentLegend data={data} />}
        </>
      )}
    </ChartCard>
  )
}
