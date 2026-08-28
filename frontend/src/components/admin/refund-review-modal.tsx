import { toast } from 'sonner'
import { AlertCircle, RotateCcw, ShoppingBag } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProductImage } from '@/components/common/product-image'
import { Spinner } from '@/components/common/loading-state'
import { useProcessRefund } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate, formatPrice } from '@/utils/format'
import type { OrderResponse } from '@/types'

interface RefundReviewModalProps {
  order: OrderResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RefundReviewModal({
  order,
  open,
  onOpenChange,
  onSuccess,
}: RefundReviewModalProps) {
  const processRefund = useProcessRefund()

  if (!order) return null

  const handleProceed = () => {
    processRefund.mutate(order.publicId, {
      onSuccess: () => {
        toast.success(`Refund for order ${order.orderNumber} processed successfully`)
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, 'Could not process refund. Please try again.'))
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Review Refund Request</DialogTitle>
              <DialogDescription className="text-xs">
                Order <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span> placed on{' '}
                {formatDate(order.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Details & Items to Refund */}
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            <div>
              Recipient: <span className="font-medium text-foreground">{order.shippingAddress.recipientName}</span>
            </div>
            <div>
              Items: <span className="font-medium text-foreground">{order.items.reduce((s, i) => s + i.quantity, 0)} total</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Products flagged for refund</span>
            </div>

            <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div
                  key={item.publicId}
                  className="flex items-center gap-3.5 rounded-xl border bg-card/60 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted/20">
                    <ProductImage
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-background/90 px-1 text-[9px] font-bold shadow-sm">
                      ×{item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Refund Summary Breakdown */}
          <div className="rounded-xl border bg-muted/[0.18] p-4 text-xs space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(order.itemsSubtotal)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount Applied</span>
                <span className="font-medium tabular-nums">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            {Number(order.shippingFee) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-medium tabular-nums">{formatPrice(order.shippingFee)}</span>
              </div>
            )}
            <Separator className="my-1.5" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">Total Refund Amount</span>
              <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Admin notice */}
          <div className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Clicking <strong>Proceed</strong> will finalize the refund, update the payment status, restore inventory stock, and mark the client's order tracking as <strong>Product Refunded</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={processRefund.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={processRefund.isPending}
            onClick={handleProceed}
          >
            {processRefund.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Proceed with Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}