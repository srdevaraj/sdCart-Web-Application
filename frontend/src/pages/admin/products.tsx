import { useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProductStatusBadge } from '@/components/common/status-badge'
import { ProductImage } from '@/components/common/product-image'
import { ProductForm } from '@/features/admin/product-form'
import { useAdminProducts, useDeleteProduct } from '@/features/admin/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/lib/api-client'
import { formatPrice } from '@/utils/format'
import type { ProductResponse, ProductStatus } from '@/types'

export default function AdminProductsPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ProductStatus | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductResponse | null>(null)

  const debouncedQ = useDebounce(q, 400)
  const productsQuery = useAdminProducts(debouncedQ || undefined, status, page, 20)
  const deleteProduct = useDeleteProduct()

  const products = productsQuery.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products ? `${products.totalElements} products` : 'Manage your catalog'}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add product
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
            placeholder="Search products…"
            aria-label="Search products"
            className="pl-8"
          />
        </div>
        {(['ACTIVE', 'INACTIVE', 'DRAFT'] as ProductStatus[]).map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatus(status === s ? undefined : s)
              setPage(0)
            }}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {productsQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : productsQuery.isError ? (
        <ErrorState onRetry={() => productsQuery.refetch()} message="We couldn't load products." />
      ) : !products ? null : products.empty ? (
        <EmptyState
          title="No products found"
          description="Try a different search or add a new product."
          action={
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4" aria-hidden /> Add product
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.content.map((product) => (
                  <tr key={product.publicId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={product.images[0]?.imageUrl} alt={product.name} className="h-10 w-10 shrink-0 rounded-md" />
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku ?? product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatPrice(product.price)}
                      {product.featured && (
                        <Badge variant="secondary" className="ml-2">Featured</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stockQuantity === 0
                            ? 'font-semibold text-destructive'
                            : product.stockQuantity <= 10
                              ? 'font-semibold text-warning'
                              : 'tabular-nums'
                        }
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditing(product)
                            setDialogOpen(true)
                          }}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDialog
                          title="Deactivate product?"
                          description={`${product.name} will be hidden from the store catalog.`}
                          confirmLabel="Deactivate"
                          destructive
                          onConfirm={async () => {
                            await deleteProduct.mutateAsync(product.publicId, {
                              onError: (error) => toast.error(getErrorMessage(error, 'Could not deactivate product')),
                            })
                            toast.success('Product deactivated')
                          }}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label={`Deactivate ${product.name}`}>
                              <Trash2 />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
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
            <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
            <DialogDescription>
              {editing ? `Editing "${editing.name}"` : 'Create a new product in the catalog.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            key={editing?.publicId ?? 'new'}
            product={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
