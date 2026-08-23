import { Ban, ImageOff, Info, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProductStatusBadge } from '@/components/common/status-badge'
import { useAdminBannerProducts, useDeleteProduct, useUpdateProduct } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { ProductResponse } from '@/types'

export default function AdminBannerProductsPage() {
  const bannersQuery = useAdminBannerProducts()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const bannerProducts = bannersQuery.data

  const handleClearBanner = async (product: ProductResponse) => {
    try {
      await updateProduct.mutateAsync({
        publicId: product.publicId,
        payload: { bannerImage: '' },
      })
      toast.success(`Banner image removed from "${product.name}"`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not remove banner image'))
    }
  }

  const handleDeactivate = async (product: ProductResponse) => {
    try {
      await deleteProduct.mutateAsync(product.publicId)
      toast.success(`"${product.name}" deactivated`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not deactivate product'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Banner Products</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              Hero Rotation
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {bannerProducts
              ? `${bannerProducts.length} ${bannerProducts.length === 1 ? 'product' : 'products'} currently configured with a hero banner`
              : 'Manage products featured in the homepage hero banner rotation'}
          </p>
        </div>
      </header>

      {/* Informational callout */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90">
        <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Homepage Hero Rotation</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This view displays only products that currently have a dedicated banner image set.
            Clicking <strong>Delete</strong> clears only the banner image so the product leaves the hero rotation while remaining intact in the catalog.
            Clicking <strong>Deactivate</strong> deactivates the product across the entire store catalog.
          </p>
        </div>
      </div>

      {/* Query state rendering */}
      {bannersQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : bannersQuery.isError ? (
        <ErrorState onRetry={() => bannersQuery.refetch()} message="We couldn't load banner products." />
      ) : !bannerProducts || bannerProducts.length === 0 ? (
        <EmptyState
          title="No banner products found"
          description="No products currently have a hero banner image set. You can assign a banner image to any product from the Products tab."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 w-48">Banner Preview</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bannerProducts.map((product) => (
                  <tr key={product.publicId} className="transition-colors hover:bg-muted/30">
                    {/* Banner Thumbnail */}
                    <td className="px-4 py-3.5">
                      <div className="relative h-16 w-36 overflow-hidden rounded-lg border bg-muted shadow-xs group">
                        {product.bannerImage ? (
                          <img
                            src={product.bannerImage}
                            alt={`${product.name} banner`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Product Name & SKU */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {product.sku ?? product.slug}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {product.category?.name ?? '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <ProductStatusBadge status={product.status} />
                    </td>

                    {/* Exactly two actions: Delete (clear banner) and Deactivate */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Delete Action: Clears banner image only */}
                        <ConfirmDialog
                          title="Remove banner image?"
                          description={`Are you sure you want to remove the banner image for "${product.name}"? The product will remain in the catalog but will immediately leave the homepage hero banner rotation.`}
                          confirmLabel="Delete Banner"
                          destructive
                          onConfirm={() => handleClearBanner(product)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5"
                              aria-label={`Delete banner image for ${product.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </Button>
                          }
                        />

                        {/* Deactivate Action: Deactivates product across store */}
                        <ConfirmDialog
                          title="Deactivate product?"
                          description={`Are you sure you want to deactivate "${product.name}"? It will be hidden from the store catalog.`}
                          confirmLabel="Deactivate"
                          destructive
                          onConfirm={() => handleDeactivate(product)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground gap-1.5"
                              aria-label={`Deactivate product ${product.name}`}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
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
        </div>
      )}
    </div>
  )
}
