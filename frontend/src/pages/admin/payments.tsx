import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PaymentStatusBadge } from '@/components/common/status-badge'
import { useAdminPayments } from '@/features/admin/hooks'
import { formatDate, formatPrice } from '@/utils/format'
import { PAYMENT_METHOD_LABELS } from '@/types'

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(0)
  const paymentsQuery = useAdminPayments(page, 20)

  const payments = paymentsQuery.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {payments ? `${payments.totalElements} transactions` : 'Payment transactions'}
        </p>
      </header>

      {paymentsQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : paymentsQuery.isError ? (
        <ErrorState onRetry={() => paymentsQuery.refetch()} message="We couldn't load payments." />
      ) : !payments ? null : payments.empty ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Completed and pending payments will appear here."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.content.map((payment) => (
                  <tr key={payment.publicId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{payment.transactionId}</p>
                      <p className="text-xs text-muted-foreground">Order {payment.orderPublicId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">{PAYMENT_METHOD_LABELS[payment.method]}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={payments.page}
            totalPages={payments.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}
    </div>
  )
}
