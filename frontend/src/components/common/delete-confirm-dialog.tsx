import { useState, type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/common/loading-state'

interface DeleteConfirmDialogProps {
  trigger: ReactNode
  title: string
  entityName: string
  description?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

export function DeleteConfirmDialog({
  trigger,
  title,
  entityName,
  description,
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const isMatch = confirmText.trim() === entityName

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
      setConfirmText('')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setConfirmText('')
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {description ?? (
                  <>
                    You are about to permanently delete{' '}
                    <span className="font-semibold text-foreground">"{entityName}"</span>.
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="confirm-delete" className="text-sm font-medium text-foreground">
                  To confirm, type: <span className="font-mono">{entityName}</span>
                </label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={entityName}
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || !isMatch}
            onClick={(e) => {
              e.preventDefault()
              void handleConfirm()
            }}
            className={
              destructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Deleting…
              </span>
            ) : (
              title.includes('Delete') || destructive ? 'Delete' : 'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
