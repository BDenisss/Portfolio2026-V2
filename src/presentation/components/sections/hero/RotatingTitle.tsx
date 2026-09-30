'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/presentation/lib/cn'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

const ROTATION_INTERVAL_MS = 3200

type RotatingTitleProps = { titles: readonly string[]; label: string }

/**
 * Titre qui alterne les métiers. Le rendu serveur affiche le premier ; tous sont lus par les lecteurs d'écran.
 * Figé sous reduced-motion et au survol.
 */
export function RotatingTitle({ titles, label }: RotatingTitleProps) {
  const [rotations, setRotations] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const rotates = titles.length > 1 && !paused && !reducedMotion
  const index = rotations % Math.max(titles.length, 1)

  useEffect(() => {
    if (!rotates) return
    const timer = setInterval(() => setRotations((current) => current + 1), ROTATION_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [rotates])

  return (
    <p
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="font-display text-[clamp(1.5rem,0.8rem+3vw,2.75rem)] leading-tight font-semibold"
    >
      <span className="sr-only">
        {label} {titles.join(', ')}
      </span>
      <span
        key={rotations}
        aria-hidden="true"
        // Le premier titre s'affiche sans fondu (texte de tête de page) ; seules les rotations suivantes s'animent.
        className={cn(
          'inline-block bg-linear-to-r from-[var(--accent-strong)] to-[var(--accent)] bg-clip-text text-transparent',
          rotations > 0 && 'hero-title-in',
        )}
      >
        {titles[index]}
      </span>
    </p>
  )
}
