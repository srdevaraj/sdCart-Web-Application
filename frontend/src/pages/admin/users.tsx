import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAdminUsers, useSetUserActive } from '@/features/admin/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/lib/api-client'
import { formatDate } from '@/utils/format'

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 400)

  const usersQuery = useAdminUsers(debouncedQ || undefined, page, 20)
  const setActive = useSetUserActive()

  const users = usersQuery.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users ? `${users.totalElements} registered users` : 'Manage customer accounts'}
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
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.content.map((user) => (
                  <tr key={user.publicId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.active ? 'success' : 'destructive'}>
                        {user.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
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
                          await setActive.mutateAsync(
                            { publicId: user.publicId, active: !user.active },
                            {
                              onError: (error) => toast.error(getErrorMessage(error, 'Could not update user')),
                            },
                          )
                          toast.success(user.active ? 'User disabled' : 'User enabled')
                        }}
                        trigger={
                          <Button variant="ghost" size="sm" aria-label={`Toggle ${user.firstName} ${user.lastName} active`}>
                            <Switch checked={user.active} onCheckedChange={() => undefined} aria-hidden />
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ))}
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
    </div>
  )
}
