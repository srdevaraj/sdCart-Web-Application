import { useState } from 'react'
import { MapPin, Pencil, Plus, ShieldCheck, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { AddressForm } from '@/features/addresses/address-form'
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/features/addresses/hooks'
import { getErrorMessage } from '@/lib/api-client'
import type { AddressResponse } from '@/types'
import { Reveal } from '@/components/common/reveal'

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
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-[220px] rounded-[28px]" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-[300px] rounded-[24px]" />
          <Skeleton className="h-[300px] rounded-[24px]" />
        </div>
      </div>
    )
  }

  if (addressesQuery.isError) {
    return (
      <ErrorState
        onRetry={() => addressesQuery.refetch()}
        message="We couldn't load your addresses."
      />
    )
  }

  const addresses = addressesQuery.data ?? []

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================================
          HERO
      ================================================================= */}
      <Reveal>
        <section className="group relative overflow-hidden rounded-[30px] border bg-card shadow-sm transition-all duration-500 hover:shadow-xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/[0.10] blur-3xl transition-transform duration-1000 group-hover:scale-125" />

            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-primary/[0.045] blur-3xl" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.025] via-transparent to-transparent" />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_auto]">
            {/* Main content */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Icon */}
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-primary/[0.08] text-primary shadow-sm transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
                    <MapPin className="h-9 w-9 sm:h-10 sm:w-10" />

                    {addresses.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-md">
                        {addresses.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Heading */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Delivery preferences
                  </p>

                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Shipping addresses
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mx-0 sm:text-base">
                    Save your frequently used delivery locations for a
                    faster, smoother checkout experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Side action */}
            <div className="border-t bg-background/50 p-6 backdrop-blur-sm lg:w-[290px] lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Address book
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                      {addresses.length}{' '}
                      {addresses.length === 1
                        ? 'address'
                        : 'addresses'}
                    </span>
                  </div>

                  <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Saved locations
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {addresses.length === 0
                            ? 'No addresses saved'
                            : 'Ready for checkout'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={openCreate}
                  className="group/add mt-6 h-11 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" />
                  Add new address
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ================================================================
          EMPTY STATE
      ================================================================= */}
      {addresses.length === 0 ? (
        <Reveal delay={100}>
          <div className="rounded-[28px] border bg-card p-8 shadow-sm sm:p-12">
            <EmptyState
              icon={MapPin}
              title="Your address book is empty"
              description="Save a delivery address now and make your next checkout faster."
              action={
                <Button
                  onClick={openCreate}
                  className="group h-11 rounded-xl px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Add your first address
                </Button>
              }
            />
          </div>
        </Reveal>
      ) : (
        <>
          {/* ================================================================
              SECTION HEADER
          ================================================================= */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Saved locations
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Your delivery addresses
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Securely stored
              </div>
            </div>
          </Reveal>

          {/* ================================================================
              ADDRESS GRID
          ================================================================= */}
          <div className="grid gap-5 sm:grid-cols-2">
            {addresses.map((address, index) => (
              <Reveal
                key={address.publicId}
                delay={130 + index * 55}
              >
                <article
                  className={`group relative h-full overflow-hidden rounded-[26px] border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                    address.isDefault
                      ? 'border-primary/25'
                      : ''
                  }`}
                >
                  {/* Decorative glow */}
                  <div
                    className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${
                      address.isDefault
                        ? 'bg-primary/[0.10]'
                        : 'bg-primary/[0.045]'
                    }`}
                  />

                  {/* Default top accent */}
                  {address.isDefault && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                  )}

                  <div className="relative flex h-full flex-col">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-br from-primary/[0.025] to-transparent p-5 sm:p-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                            address.isDefault
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted/60 text-muted-foreground'
                          }`}
                        >
                          <MapPin className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-bold tracking-tight">
                              {address.label}
                            </h2>

                            {address.isDefault && (
                              <Badge
                                variant="secondary"
                                className="gap-1 rounded-full border border-primary/10 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                              >
                                <Star className="h-2.5 w-2.5 fill-current" />
                                Default
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {address.recipientName}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(address)}
                          aria-label={`Edit ${address.label}`}
                          className="rounded-lg text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4 transition-transform duration-300 group-hover:scale-105" />
                        </Button>

                        <ConfirmDialog
                          title="Delete this address?"
                          description={`${address.label} — ${address.line1}, ${address.city} will be removed.`}
                          confirmLabel="Delete"
                          destructive
                          onConfirm={async () => {
                            await deleteAddress.mutateAsync(
                              address.publicId,
                              {
                                onError: (error) =>
                                  toast.error(
                                    getErrorMessage(
                                      error,
                                      'Could not delete address',
                                    ),
                                  ),
                              },
                            )

                            toast.success('Address deleted')
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${address.label}`}
                              className="rounded-lg text-muted-foreground transition-all duration-300 hover:bg-destructive/5 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {/* Address body */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="rounded-2xl border bg-muted/[0.16] p-4 transition-colors duration-300 group-hover:bg-muted/[0.24]">
                        <div className="flex gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                          <div className="min-w-0 text-sm leading-6 text-muted-foreground">
                            <p className="font-semibold text-foreground">
                              {address.recipientName}
                            </p>

                            <p className="mt-1">
                              {address.line1}

                              {address.line2
                                ? `, ${address.line2}`
                                : ''}
                            </p>

                            <p>
                              {address.city}

                              {address.state
                                ? `, ${address.state}`
                                : ''}{' '}

                              {address.postalCode}
                            </p>

                            <p>{address.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="mt-4 flex items-center justify-between gap-3 border-b pb-4">
                        <span className="text-xs font-medium text-muted-foreground">
                          Contact number
                        </span>

                        <span className="truncate text-xs font-semibold">
                          {address.phone}
                        </span>
                      </div>

                      {/* Bottom action */}
                      <div className="mt-auto pt-5">
                        {address.isDefault ? (
                          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/[0.07] px-3 py-2.5 text-xs font-medium text-emerald-600">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                              <Star className="h-3 w-3 fill-current" />
                            </span>

                            This is your default delivery address
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="group/default h-10 w-full rounded-xl transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.035] hover:text-primary"
                            onClick={() =>
                              setDefault.mutate(
                                address.publicId,
                                {
                                  onSuccess: () =>
                                    toast.success(
                                      'Default address updated',
                                    ),
                                  onError: (error) =>
                                    toast.error(
                                      getErrorMessage(error),
                                    ),
                                },
                              )
                            }
                            disabled={setDefault.isPending}
                          >
                            <Star className="mr-2 h-3.5 w-3.5 transition-transform duration-300 group-hover/default:scale-110 group-hover/default:fill-current" />

                            Set as default
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </>
      )}

      {/* ================================================================
          ADDRESS DIALOG
      ================================================================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[26px] sm:max-w-xl">
          <DialogHeader className="border-b pb-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {editing ? (
                <Pencil className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </div>

            <DialogTitle className="text-xl">
              {editing
                ? 'Edit delivery address'
                : 'Add delivery address'}
            </DialogTitle>

            <DialogDescription className="leading-5">
              {editing
                ? 'Update the details below to keep your delivery information current.'
                : 'Add a shipping address to make your future checkout faster.'}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <AddressForm
              key={editing?.publicId ?? 'new'}
              address={editing ?? undefined}
              onSuccess={() => setDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}