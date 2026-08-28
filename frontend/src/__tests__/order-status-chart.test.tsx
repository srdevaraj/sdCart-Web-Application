import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { OrderStatusChart } from '@/components/admin/charts/order-status-chart'
import { dashboardService } from '@/services/dashboard'
import type { StatusCount } from '@/types'

vi.mock('@/services/dashboard', () => ({
  dashboardService: {
    getOrderStatusSummary: vi.fn(),
  },
}))

const mockStatusSummary: StatusCount[] = [
  { status: 'DELIVERED', count: 12, percentage: 50.0 },
  { status: 'PENDING', count: 4, percentage: 16.7 },
  { status: 'CONFIRMED', count: 2, percentage: 8.3 },
  { status: 'CANCELLED', count: 3, percentage: 12.5 },
  { status: 'REFUND_REQUESTED', count: 1, percentage: 4.2 },
  { status: 'REFUNDED', count: 2, percentage: 8.3 },
]

describe('OrderStatusChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all 4 buckets including Product Refund with correct counts in the legend', async () => {
    vi.mocked(dashboardService.getOrderStatusSummary).mockResolvedValue(mockStatusSummary)

    renderWithProviders(<OrderStatusChart />)

    // Wait for the async data to load
    expect(await screen.findByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()

    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()

    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText('Product Refund')).toBeInTheDocument()
  })

  it('renders empty state when there are no orders', async () => {
    vi.mocked(dashboardService.getOrderStatusSummary).mockResolvedValue([])

    renderWithProviders(<OrderStatusChart />)

    expect(await screen.findByText('No orders placed yet.')).toBeInTheDocument()
  })
})
