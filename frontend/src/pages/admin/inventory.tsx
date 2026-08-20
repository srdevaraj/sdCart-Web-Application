import { useState } from 'react'
import { Pencil, Search, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ProductImage } from '@/components/common/product-image'
import { ProductForm } from '@/features/admin/product-form'
import { useAdminProducts } from '@/features/admin/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import type { ProductResponse } from '@/types'
import { formatPrice } from '@/utils/format'

export default function AdminInventoryPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<ProductResponse | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const debouncedQ = useDebounce(q, 400)
  const inventoryQuery = useAdminProducts(debouncedQ || undefined, undefined, page, 20)

  const products = inventoryQuery.data

  function openEdit(product: ProductResponse) {
    setEditing(product)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor stock levels and update quantities.</p>
      </header>

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(0)
          }}
          placeholder="Search inventory…"
          aria-label="Search inventory"
          className="pl-8"
        />
      </div>

      {inventoryQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : inventoryQuery.isError ? (
        <ErrorState onRetry={() => inventoryQuery.refetch()} message="We couldn't load inventory." />
      ) : !products ? null : products.empty ? (
        <EmptyState
          icon={Warehouse}
          title="No products in inventory"
          description="Products you add will appear here with live stock levels."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock level</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.content.map((product) => {
                  const level =
                    product.stockQuantity === 0 ? 'out' : product.stockQuantity <= 10 ? 'low' : 'ok'
                  return (
                    <tr key={product.publicId} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage src={product.images[0]?.imageUrl} alt={product.name} className="h-10 w-10 shrink-0 rounded-md" />
                          <p className="line-clamp-1 font-medium">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{product.sku ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <span
                              className={`block h-full ${
                                level === 'out' ? 'bg-destructive' : level === 'low' ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${Math.min(100, (product.stockQuantity / 100) * 100)}%` }}
                            />
                          </span>
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              level === 'out' ? 'text-destructive' : level === 'low' ? 'text-warning' : ''
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                          {level === 'low' && (
                            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning">
                              Low
                            </span>
                          )}
                          {level === 'out' && (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                              Out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(product)} aria-label={`Update stock for ${product.name}`}>
                          <Pencil />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={products.page}
            totalPages={products.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update stock</DialogTitle>
            <DialogDescription>
              {editing ? `Adjust quantities for "${editing.name}".` : ''}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            key={editing?.publicId ?? 'inventory-new'}
            product={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
