import { Badge } from '@/components/ui/badge'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
  type ProductStatus,
  PRODUCT_STATUS_LABELS,
} from '@/types'

const ORDER_STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  PENDING: 'warning',
  AWAITING_PAYMENT: 'warning',
  CONFIRMED: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  PAYMENT_FAILED: 'destructive',
}

const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive'
> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_VARIANT[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={PAYMENT_STATUS_VARIANT[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const variant =
    status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'destructive' : ('secondary' as const)
  return <Badge variant={variant}>{PRODUCT_STATUS_LABELS[status]}</Badge>
}
