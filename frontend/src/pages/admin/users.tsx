import { useState } from 'react'
import { ShieldCheck, Search, ShieldAlert, UserCog, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { useAdminUsers, useSetUserActive, useUpdateUserRole } from '@/features/admin/hooks'
import { useAuthStore } from '@/features/auth/auth-store'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate } from '@/utils/format'
import type { RoleName, UserResponse } from '@/types'

const ROLE_LABELS: Record<RoleName, { label: string; desc: string }> = {
  USER: { label: 'Customer', desc: 'Standard shopping and order tracking access' },
  DELIVERY_PERSON: { label: 'Delivery Person', desc: 'Dedicated delivery portal for picking up and fulfilling orders' },
  ADMIN: { label: 'Administrator', desc: 'Full administrative access to products, orders, and system settings' },
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 400)

  const currentAdmin = useAuthStore((s) => s.user)
  const usersQuery = useAdminUsers(debouncedQ || undefined, page, 20)
  const setActive = useSetUserActive()
  const updateRole = useUpdateUserRole()

  // Role Edit Modal State
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleName>('USER')
  const [vehicleType, setVehicleType] = useState('')
  const [serviceZone, setServiceZone] = useState('')

  const users = usersQuery.data

  const handleOpenRoleModal = (user: UserResponse) => {
    setSelectedUser(user)
    const primaryRole = user.roles.includes('ADMIN')
      ? 'ADMIN'
      : user.roles.includes('DELIVERY_PERSON')
      ? 'DELIVERY_PERSON'
      : 'USER'
    setSelectedRole(primaryRole)
    setVehicleType('Motorcycle / Scooter')
    setServiceZone('Central / Downtown')
  }

  const handleSaveRole = async () => {
    if (!selectedUser) return
    try {
      await updateRole.mutateAsync({
        publicId: selectedUser.publicId,
        payload: {
          role: selectedRole,
          vehicleType: selectedRole === 'DELIVERY_PERSON' ? vehicleType : undefined,
          serviceZone: selectedRole === 'DELIVERY_PERSON' ? serviceZone : undefined,
        },
      })
      toast.success(
        `Role for ${selectedUser.firstName} ${selectedUser.lastName} updated to ${ROLE_LABELS[selectedRole].label}`,
      )
      setSelectedUser(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update user role'))
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users ? `${users.totalElements} registered users` : 'Manage customer, delivery, and administrator accounts'}
        </p>
      </header>

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(0)
          }}
          placeholder="Search by name or email…"
          aria-label="Search users"
          className="pl-8"
        />
      </div>

      {usersQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <ErrorState onRetry={() => usersQuery.refetch()} message="We couldn't load users." />
      ) : !users ? null : users.empty ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search term." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.content.map((user) => {
                  const isSelf = currentAdmin?.publicId === user.publicId

                  return (
                    <tr key={user.publicId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.phone && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{user.phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={
                                role === 'ADMIN' ? 'default' : role === 'DELIVERY_PERSON' ? 'outline' : 'secondary'
                              }
                              className={
                                role === 'DELIVERY_PERSON'
                                  ? 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10'
                                  : undefined
                              }
                            >
                              {ROLE_LABELS[role]?.label ?? role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? 'success' : 'destructive'}>
                          {user.active ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ConfirmDialog
                          title={user.active ? 'Disable this user?' : 'Enable this user?'}
                          description={
                            user.active
                              ? `${user.firstName} ${user.lastName} will not be able to sign in.`
                              : `${user.firstName} ${user.lastName} will regain access.`
                          }
                          confirmLabel={user.active ? 'Disable' : 'Enable'}
                          destructive={user.active}
                          onConfirm={async () => {
                            if (isSelf) {
                              toast.error('You cannot disable your own administrator account.')
                              return
                            }
                            await setActive.mutateAsync(
                              { publicId: user.publicId, active: !user.active },
                              {
                                onError: (error) => toast.error(getErrorMessage(error, 'Could not update user')),
                              },
                            )
                            toast.success(user.active ? 'User disabled' : 'User enabled')
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf}
                              title={isSelf ? 'Cannot disable yourself' : undefined}
                              aria-label={`Toggle ${user.firstName} ${user.lastName} active`}
                            >
                              <Switch checked={user.active} onCheckedChange={() => undefined} aria-hidden />
                            </Button>
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf}
                          title={isSelf ? 'You cannot modify your own role' : 'Edit role and permissions'}
                          onClick={() => handleOpenRoleModal(user)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <UserCog className="h-3.5 w-3.5" />
                          <span>Edit Role</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={users.page}
            totalPages={users.totalPages}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}

      {/* Role Editing Modal */}
      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Edit User Role
            </DialogTitle>
            <DialogDescription>
              Modify role and access permissions for{' '}
              <span className="font-semibold text-foreground">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </span>{' '}
              ({selectedUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="role-select">Assigned Role</Label>
              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as RoleName)}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">
                    <div className="py-0.5">
                      <div className="font-medium text-sm">Customer</div>
                      <div className="text-xs text-muted-foreground">Standard customer ordering access</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="DELIVERY_PERSON">
                    <div className="py-0.5">
                      <div className="font-medium text-sm">Delivery Person</div>
                      <div className="text-xs text-muted-foreground">Delivery portal access for order fulfillment</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="py-0.5">
                      <div className="font-medium text-sm">Administrator</div>
                      <div className="text-xs text-muted-foreground">Full dashboard access to manage system</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Person specific setup fields */}
            {selectedRole === 'DELIVERY_PERSON' && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  Delivery Person Profile Setup
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleType" className="text-xs">
                    Vehicle Type
                  </Label>
                  <Input
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Motorcycle, Scooter, Van, Bicycle"
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="serviceZone" className="text-xs">
                    Service Area / Zone
                  </Label>
                  <Input
                    id="serviceZone"
                    value={serviceZone}
                    onChange={(e) => setServiceZone(e.target.value)}
                    placeholder="e.g. Downtown / North Zone / Sector 4"
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'ADMIN' && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Granting administrator privileges provides full read and write access to store revenue, products, orders,
                  and user data.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <ConfirmDialog
              title="Confirm Role Change"
              description={`Are you sure you want to change ${selectedUser?.firstName} ${selectedUser?.lastName}'s role to ${selectedRole ? ROLE_LABELS[selectedRole]?.label : ''}?`}
              confirmLabel="Confirm Role Change"
              destructive={selectedRole !== 'ADMIN' && Boolean(selectedUser?.roles.includes('ADMIN'))}
              onConfirm={handleSaveRole}
              trigger={
                <Button disabled={updateRole.isPending}>
                  Review & Save
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

