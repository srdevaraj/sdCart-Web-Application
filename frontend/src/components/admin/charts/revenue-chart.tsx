import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChartCard } from './chart-card'
import { useRevenueMonthly, useRevenueYearly } from '@/features/admin/hooks'
import { formatPrice } from '@/utils/format'
import type { MonthlyRevenue, YearlyRevenue } from '@/types'

// ---------------------------------------------------------------------------
// Color palette — matches design tokens (light-mode HSL values)
// ---------------------------------------------------------------------------

/** Gradient from brand primary to accent-warm for the active bar fill */
const BAR_GRADIENT_ID = 'revenueBarGradient'
const SELECTED_GRADIENT_ID = 'revenueSelectedGradient'

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function YearlyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: YearlyRevenue }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-pop text-xs">
      <p className="font-semibold text-foreground">{d.year}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatPrice(d.totalRevenue)}</span>
      </p>
    </div>
  )
}

function MonthlyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: MonthlyRevenue }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-pop text-xs">
      <p className="font-semibold text-foreground">{d.monthName}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatPrice(d.revenue)}</span>
      </p>
      <p className="text-muted-foreground">
        Share: <span className="font-semibold text-foreground">{d.percentOfYear.toFixed(1)}%</span>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function YearlyView({ onYearClick }: { onYearClick: (year: number) => void }) {
  const { data, isPending, isError } = useRevenueYearly(5)

  const hasData = (data ?? []).some((d) => Number(d.totalRevenue) > 0)

  return (
    <ChartCard
      title="Revenue"
      subtitle="Last 5 years — click a bar to drill down"
      isLoading={isPending}
      isEmpty={!isPending && (!data || !hasData)}
      emptyMessage="No revenue recorded yet."
    >
      {isError && (
        <p className="py-4 text-center text-sm text-destructive">
          Failed to load revenue data.
        </p>
      )}
      {data && hasData && (
        <>
          {/* SVG gradient definition */}
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id={BAR_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(243, 75%, 59%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(243, 75%, 72%)" stopOpacity={0.85} />
              </linearGradient>
            </defs>
          </svg>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(240, 6%, 90%)"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(240, 4%, 42%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 100000
                    ? `₹${(v / 100000).toFixed(0)}L`
                    : v >= 1000
                    ? `₹${(v / 1000).toFixed(0)}K`
                    : `₹${v}`
                }
                tick={{ fontSize: 10, fill: 'hsl(240, 4%, 42%)' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<YearlyTooltip />} cursor={{ fill: 'hsl(243, 75%, 59%, 0.06)' }} />
              <Bar
                dataKey="totalRevenue"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
                onClick={(barData) => {
                  const d = barData as unknown as YearlyRevenue
                  onYearClick(d.year)
                }}
              >
                {(data ?? []).map((entry) => (
                  <Cell
                    key={entry.year}
                    fill={`url(#${BAR_GRADIENT_ID})`}
                    className="transition-opacity duration-150 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Click any bar to see month-by-month breakdown
          </p>
        </>
      )}
    </ChartCard>
  )
}

function MonthlyView({
  year,
  onBack,
}: {
  year: number
  onBack: () => void
}) {
  const { data, isPending, isError } = useRevenueMonthly(year)
  const hasData = (data ?? []).some((d) => Number(d.revenue) > 0)

  const breadcrumb = (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={onBack}
    >
      <ChevronLeft className="h-3 w-3" />
      5-Year view
    </Button>
  )

  return (
    <ChartCard
      title="Revenue"
      subtitle={`Monthly breakdown — ${year}`}
      isLoading={isPending}
      isEmpty={!isPending && (!data || !hasData)}
      emptyMessage={`No revenue recorded for ${year}.`}
      headerAction={breadcrumb}
    >
      {isError && (
        <p className="py-4 text-center text-sm text-destructive">
          Failed to load monthly data.
        </p>
      )}
      {data && hasData && (
        <>
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id={SELECTED_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(24, 95%, 53%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(24, 95%, 68%)" stopOpacity={0.85} />
              </linearGradient>
            </defs>
          </svg>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(240, 6%, 90%)"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="monthName"
                tick={{ fontSize: 10, fill: 'hsl(240, 4%, 42%)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 100000
                    ? `₹${(v / 100000).toFixed(0)}L`
                    : v >= 1000
                    ? `₹${(v / 1000).toFixed(0)}K`
                    : `₹${v}`
                }
                tick={{ fontSize: 10, fill: 'hsl(240, 4%, 42%)' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'hsl(24, 95%, 53%, 0.06)' }} />
              <Bar dataKey="revenue" radius={[5, 5, 0, 0]} fill={`url(#${SELECTED_GRADIENT_ID})`} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </ChartCard>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Revenue chart with yearly → monthly drill-down.
 * Clicking a year bar transitions in-place (AnimatePresence crossfade) to a
 * monthly breakdown. A breadcrumb returns to the 5-year view.
 */
export function RevenueChart() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait" initial={false}>
        {selectedYear === null ? (
          <motion.div
            key="yearly"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <YearlyView onYearClick={setSelectedYear} />
          </motion.div>
        ) : (
          <motion.div
            key={`monthly-${selectedYear}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            <MonthlyView year={selectedYear} onBack={() => setSelectedYear(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
