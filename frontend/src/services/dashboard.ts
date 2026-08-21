import { request } from '@/lib/api-client'
import type { MonthlyRevenue, StatusCount, YearlyRevenue } from '@/types'

/**
 * Dashboard analytics API — all calls are GET-only (read-only, no mutations).
 * Base URL: /api/v1/admin/dashboard
 */
export const dashboardService = {
  /**
   * Yearly revenue totals for the last {@code years} calendar years (default 5).
   * Includes years with ₹0 revenue so the chart always shows a complete window.
   */
  async getRevenueYearly(years = 5): Promise<YearlyRevenue[]> {
    return request<YearlyRevenue[]>({
      method: 'GET',
      url: '/admin/dashboard/revenue/yearly',
      params: { years },
    })
  },

  /**
   * 12-month breakdown for a specific calendar year.
   * All 12 months are always returned; months with no orders have revenue = 0.
   */
  async getRevenueMonthly(year: number): Promise<MonthlyRevenue[]> {
    return request<MonthlyRevenue[]>({
      method: 'GET',
      url: `/admin/dashboard/revenue/yearly/${year}/monthly`,
    })
  },

  /**
   * Count + percentage for every PaymentStatus value (PENDING, COMPLETED, FAILED, REFUNDED).
   */
  async getPaymentStatusSummary(): Promise<StatusCount[]> {
    return request<StatusCount[]>({
      method: 'GET',
      url: '/admin/dashboard/payments/status-summary',
    })
  },

  /**
   * Count + percentage for every OrderStatus value (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED).
   * The frontend applies the 3-bucket grouping (Delivered / In Progress / Cancelled).
   */
  async getOrderStatusSummary(): Promise<StatusCount[]> {
    return request<StatusCount[]>({
      method: 'GET',
      url: '/admin/dashboard/orders/status-summary',
    })
  },
}
