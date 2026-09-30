'use client'
import { useEffect, useId, useRef, useState } from 'react'
import type { MediaAsset } from '@/domain'
import { Glass } from '@/presentation/components/glass/Glass'
import { Button } from '@/presentation/components/ui/Button'

type CvMenuProps = {
  fullstack: MediaAsset | null
  ai: MediaAsset | null
  label: string
  fullstackLabel: string
  aiLabel: string
}

const LINK_CLASS =
  'flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-[var(--ink)] transition-colors duration-200 hover:bg-white'

/** Ferme le menu sur Échap ou clic extérieur, et rend le focus au bouton d'ouverture. */
function useDismiss(
  open: boolean,
  close: () => void,
  container: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      close()
      container.current?.querySelector('button')?.focus()
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (!container.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close, container])
}

export function CvMenu({ fullstack, ai, label, fullstackLabel, aiLabel }: CvMenuProps) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const menuId = useId()
  useDismiss(open, () => setOpen(false), container)

  const available = [
    { asset: fullstack, label: fullstackLabel },
    { asset: ai, label: aiLabel },
  ].filter((cv): cv is { asset: MediaAsset; label: string } => cv.asset !== null)

  if (available.length === 0) return null
  const [only] = available
  if (available.length === 1 && only) {
    return (
      <Button variant="secondary" icon="download" href={only.asset.url} download>
        {label}
      </Button>
    )
  }
  return (
    <div ref={container} className="relative">
      <Button
        variant="secondary"
        icon="download"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </Button>
      {open && (
        <Glass
          id={menuId}
          variant="card"
          className="absolute top-full left-0 z-20 mt-2 min-w-64 p-2"
        >
          {available.map((cv) => (
            <a key={cv.asset.url} href={cv.asset.url} download className={LINK_CLASS}>
              {cv.label}
            </a>
          ))}
        </Glass>
      )}
    </div>
  )
}
