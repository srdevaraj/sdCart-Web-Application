import { useState } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/common/loading-state'
import { ProductImage } from '@/components/common/product-image'
import { useUploadImage } from '@/features/admin/hooks'
import { getErrorMessage } from '@/lib/api-client'

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_SIZE_MB = 5

interface ImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  label?: string
  hint?: string
}

export function ImageUpload({ value, onChange, label = 'Image', hint }: ImageUploadProps) {
  const uploadImage = useUploadImage()
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_SIZE_MB} MB or smaller`)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    uploadImage.mutate(file, {
      onSuccess: (result) => {
        onChange(result.imageUrl)
        toast.success('Image uploaded')
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Image upload failed'))
      },
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <ProductImage
            src={value}
            alt={label}
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploadImage.isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Uploading…
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or{' '}
                <label className="cursor-pointer font-medium text-primary hover:underline">
                  browse
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    disabled={uploadImage.isPending}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      handleFile(file)
                    }}
                  />
                </label>
              </p>
            </>
          )}
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
