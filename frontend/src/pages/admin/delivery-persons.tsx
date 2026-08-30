import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Bike,
  Edit2,
  Eye,
  MapPin,
  Package,
  Plus,
  Power,
  Search,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormField } from '@/components/common/form-field'
import { Spinner } from '@/components/common/loading-state'
import {
  useAdminDeliveryPersons,
  useAdminOrders,
  useCreateDeliveryPerson,
  useUpdateDeliveryPerson,
} from '@/features/admin/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate } from '@/utils/format'
import type { DeliveryPersonResponse } from '@/types'

const createSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  phone: z.string().min(1, 'Phone number is required').max(30),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  serviceZone: z.string().min(1, 'Service zone is required'),
})

type CreateFormValues = z.infer<typeof createSchema>

export default function AdminDeliveryPersonsPage() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [zoneFilter, setZoneFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const suspendedParam =
    statusFilter === 'ACTIVE' ? false : statusFilter === 'SUSPENDED' ? true : undefined

  const dpQuery = useAdminDeliveryPersons(suspendedParam, page, 20)
  const createMutation = useCreateDeliveryPerson()
  const updateMutation = useUpdateDeliveryPerson()
  const ordersQuery = useAdminOrders(undefined, 0, 100)

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DeliveryPersonResponse | null>(null)
  const [editVehicle, setEditVehicle] = useState('')
  const [editZone, setEditZone] = useState('')
  const [viewHistoryTarget, setViewHistoryTarget] = useState<DeliveryPersonResponse | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      vehicleType: 'Motorcycle',
      serviceZone: 'Downtown / Central',
    },
  })

  const rawData = dpQuery.data

  // Extract unique zones for filter dropdown
  const availableZones = useMemo(() => {
    if (!rawData?.content) return []
    const zones = new Set<string>()
    rawData.content.forEach((dp) => {
      if (dp.serviceZone) zones.add(dp.serviceZone)
    })
    return Array.from(zones)
  }, [rawData])

  // Filter content by search query & zone client-side for immediate response
  const filteredContent = useMemo(() => {
    if (!rawData?.content) return []
    return rawData.content.filter((dp) => {
      const matchesSearch =
        !debouncedSearch ||
        `${dp.firstName} ${dp.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        dp.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (dp.phone && dp.phone.includes(debouncedSearch))
      const matchesZone = zoneFilter === 'ALL' || dp.serviceZone === zoneFilter
      return matchesSearch && matchesZone
    })
  }, [rawData, debouncedSearch, zoneFilter])

  // Filter orders assigned to the viewed delivery person
  const assignedOrders = useMemo(() => {
    if (!viewHistoryTarget || !ordersQuery.data?.content) return []
    return ordersQuery.data.content.filter(
      (order) => order.deliveryPerson?.publicId === viewHistoryTarget.publicId,
    )
  }, [viewHistoryTarget, ordersQuery.data])

  const handleCreateSubmit = async (data: CreateFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success(`Delivery person account created for ${data.firstName} ${data.lastName}`)
      setCreateOpen(false)
      reset()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not create delivery person'))
    }
  }

  const handleOpenEdit = (dp: DeliveryPersonResponse) => {
    setEditTarget(dp)
    setEditVehicle(dp.vehicleType || '')
    setEditZone(dp.serviceZone || '')
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    try {
      await updateMutation.mutateAsync({
        publicId: editTarget.publicId,
        payload: {
          vehicleType: editVehicle,
          serviceZone: editZone,
        },
      })
      toast.success('Delivery person profile updated')
      setEditTarget(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update delivery profile'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Delivery Persons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rawData ? `${rawData.totalElements} delivery personnel registered` : 'Manage delivery personnel, service zones, and order assignments'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Delivery Person</span>
        </Button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            aria-label="Search delivery persons"
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(0); }}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {/* Zone Filter */}
          {availableZones.length > 0 && (
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="Service Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Zones</SelectItem>
                {availableZones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Table */}
      {dpQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : dpQuery.isError ? (
        <ErrorState onRetry={() => dpQuery.refetch()} message="We couldn't load delivery personnel." />
      ) : !rawData || filteredContent.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No delivery personnel found"
          description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Click "Add Delivery Person" to register your first delivery agent.'}
          action={
            !search && statusFilter === 'ALL' ? (
              <Button onClick={() => setCreateOpen(true)} size="sm" className="mt-2 gap-1.5">
                <Plus className="h-4 w-4" /> Add Delivery Person
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Delivery Person</th>
                  <th className="px-4 py-3">Vehicle & Zone</th>
                  <th className="px-4 py-3 text-center">Active Orders</th>
                  <th className="px-4 py-3 text-center">Availability</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContent.map((dp) => (
                  <tr key={dp.publicId} className="hover:bg-muted/30 transition-colors">
                    {/* Name & Contact */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {dp.firstName} {dp.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{dp.email}</p>
                        {dp.phone && <p className="text-[11px] text-muted-foreground/80 font-mono mt-0.5">{dp.phone}</p>}
                      </div>
                    </td>

                    {/* Vehicle & Zone */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{dp.vehicleType || 'Standard'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{dp.serviceZone || 'General'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Active Orders */}
                    <td className="px-4 py-3 text-center">
                      {dp.activeOrderCount > 0 ? (
                        <Badge variant="default" className="bg-primary text-primary-foreground font-semibold px-2 py-0.5">
                          {dp.activeOrderCount} active
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </td>

                    {/* Availability (Online/Offline) */}
                    <td className="px-4 py-3 text-center">
                      {dp.available ? (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                          Offline
                        </Badge>
                      )}
                    </td>

                    {/* Account Status (Active/Suspended) */}
                    <td className="px-4 py-3 text-center">
                      <Badge variant={dp.suspended ? 'destructive' : 'outline'} className={!dp.suspended ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : undefined}>
                        {dp.suspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Order Assignments */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View order history and assignments"
                          onClick={() => setViewHistoryTarget(dp)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {/* Edit Profile */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit vehicle type and service zone"
                          onClick={() => handleOpenEdit(dp)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        {/* Suspend / Reactivate */}
                        <ConfirmDialog
                          title={dp.suspended ? 'Reactivate Delivery Agent?' : 'Suspend Delivery Agent?'}
                          description={
                            dp.suspended
                              ? `${dp.firstName} ${dp.lastName} will be reactivated and able to accept order assignments.`
                              : `${dp.firstName} ${dp.lastName} will be suspended from accepting new deliveries and logging into the delivery app.`
                          }
                          confirmLabel={dp.suspended ? 'Reactivate' : 'Suspend Account'}
                          destructive={!dp.suspended}
                          onConfirm={async () => {
                            try {
                              await updateMutation.mutateAsync({
                                publicId: dp.publicId,
                                payload: { suspended: !dp.suspended },
                              })
                              toast.success(dp.suspended ? 'Account reactivated' : 'Account suspended')
                            } catch (error) {
                              toast.error(getErrorMessage(error, 'Could not update status'))
                            }
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              title={dp.suspended ? 'Reactivate account' : 'Suspend account'}
                              className={`h-8 w-8 p-0 ${
                                dp.suspended
                                  ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                                  : 'text-muted-foreground hover:text-destructive'
                              }`}
                            >
                              <Power className="h-3.5 w-3.5" />
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
            page={rawData.page}
            totalPages={rawData.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}

      {/* Create Delivery Person Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Add New Delivery Person
            </DialogTitle>
            <DialogDescription>
              Create credentials and assign a service area for a new delivery driver.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" error={errors.firstName?.message} required>
                <Input {...register('firstName')} placeholder="e.g. David" />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message} required>
                <Input {...register('lastName')} placeholder="e.g. Miller" />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Email Address" error={errors.email?.message} required>
                <Input {...register('email')} type="email" placeholder="driver@sdcart.com" />
              </FormField>
              <FormField label="Phone Number" error={errors.phone?.message} required>
                <Input {...register('phone')} placeholder="+1 (555) 019-2834" />
              </FormField>
            </div>

            <FormField
              label="Temporary Password"
              hint="Share this secure temporary password with the delivery person"
              error={errors.password?.message}
              required
            >
              <Input {...register('password')} type="password" placeholder="••••••••••••" />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Vehicle Type" error={errors.vehicleType?.message} required>
                <Input {...register('vehicleType')} placeholder="e.g. Motorcycle, Scooter, Car" />
              </FormField>
              <FormField label="Service Area / Zone" error={errors.serviceZone?.message} required>
                <Input {...register('serviceZone')} placeholder="e.g. Downtown / North Zone" />
              </FormField>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                {createMutation.isPending && <Spinner className="h-4 w-4" />}
                Create Delivery Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Delivery Details
            </DialogTitle>
            <DialogDescription>
              Update operational vehicle and zone for{' '}
              <span className="font-semibold text-foreground">
                {editTarget?.firstName} {editTarget?.lastName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="editVehicle">Vehicle Type</Label>
              <Input
                id="editVehicle"
                value={editVehicle}
                onChange={(e) => setEditVehicle(e.target.value)}
                placeholder="e.g. Motorcycle, Scooter, Car, Van"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editZone">Service Area / Zone</Label>
              <Input
                id="editZone"
                value={editZone}
                onChange={(e) => setEditZone(e.target.value)}
                placeholder="e.g. Downtown / North Zone / Sector 4"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending && <Spinner className="h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments / Order History Modal */}
      <Dialog open={Boolean(viewHistoryTarget)} onOpenChange={(open) => !open && setViewHistoryTarget(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Assignments: {viewHistoryTarget?.firstName} {viewHistoryTarget?.lastName}
            </DialogTitle>
            <DialogDescription>
              Current and historical order deliveries assigned to this delivery agent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {assignedOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                <Package className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="font-medium">No order assignments found</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Assign orders to this driver from the Orders page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedOrders.map((order) => (
                  <div
                    key={order.publicId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 text-sm bg-card hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">#{order.orderNumber}</span>
                        <Badge
                          variant={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'SHIPPED'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {order.deliveryStatus || order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recipient: {order.shippingAddress.recipientName} ({order.shippingAddress.phone})
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        {order.shippingAddress.line1}, {order.shippingAddress.city}
                      </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <p className="font-bold text-foreground">${order.totalAmount}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewHistoryTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
