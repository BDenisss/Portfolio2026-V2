import Image from 'next/image'
import type { MediaAsset } from '@/domain'

const FALLBACK_SIZE = { width: 1200, height: 750 } as const

export function ProjectGallery({ images }: { images: readonly MediaAsset[] }) {
  if (images.length === 0) return null
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {images.map((image) => (
        <li key={image.url} className="overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width ?? FALLBACK_SIZE.width}
            height={image.height ?? FALLBACK_SIZE.height}
            sizes="(min-width: 768px) 45vw, 92vw"
            className="h-auto w-full"
          />
        </li>
      ))}
    </ul>
  )
}
