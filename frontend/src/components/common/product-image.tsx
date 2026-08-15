import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
}

export function ProductImage({ src, alt, className, imgClassName, sizes }: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-muted/60',
        className,
      )}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground" aria-hidden>
          <ImageOff className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  )
}
