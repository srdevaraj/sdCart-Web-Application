import { useState } from 'react'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { AddressForm } from '@/features/addresses/address-form'
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/features/addresses/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { AddressResponse } from '@/types'

export default function AddressesPage() {
  const addressesQuery = useAddresses()
  const setDefault = useSetDefaultAddress()
  const deleteAddress = useDeleteAddress()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AddressResponse | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(address: AddressResponse) {
    setEditing(address)
    setDialogOpen(true)
  }

  if (addressesQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      </div>
    )
  }

  if (addressesQuery.isError) {
    return <ErrorState onRetry={() => addressesQuery.refetch()} message="We couldn't load your addresses." />
  }

  const addresses = addressesQuery.data ?? []

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your shipping addresses.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden /> Add address
        </Button>
      </header>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first address
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.publicId} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{address.label}</h2>
                  {address.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(address)} aria-label={`Edit ${address.label}`}>
                    <Pencil />
                  </Button>
                  <ConfirmDialog
                    title="Delete this address?"
                    description={`${address.label} — ${address.line1}, ${address.city} will be removed.`}
                    confirmLabel="Delete"
                    destructive
                    onConfirm={async () => {
                      await deleteAddress.mutateAsync(address.publicId, {
                        onError: (error) => toast.error(getErrorMessage(error, 'Could not delete address')),
                      })
                      toast.success('Address deleted')
                    }}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${address.label}`}>
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {address.recipientName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
                <br />
                {address.city}
                {address.state ? `, ${address.state}` : ''} {address.postalCode}
                <br />
                {address.country}
                <br />
                {address.phone}
              </p>
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    setDefault.mutate(address.publicId, {
                      onSuccess: () => toast.success('Default address updated'),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    })
                  }
                >
                  <Star className="h-4 w-4" aria-hidden /> Set as default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit address' : 'Add address'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the details below.' : 'Fill in your shipping details.'}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            key={editing?.publicId ?? 'new'}
            address={editing ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
