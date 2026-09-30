import type { CSSProperties } from 'react'
import { cn } from '@/presentation/lib/cn'
import styles from './GlassOrb.module.css'

const TINTS = {
  violet: 'var(--accent-soft)',
  blue: 'var(--tint-blue)',
  teal: 'var(--tint-teal)',
} as const

type GlassOrbProps = {
  /** Toute longueur CSS ; par défaut l'orbe remplit son conteneur. */
  size?: string
  tint?: keyof typeof TINTS
  className?: string
}

/** Orbe de verre en CSS pur : repli du hero quand aucun média n'est disponible. Décoratif. */
export function GlassOrb({ size, tint = 'violet', className }: GlassOrbProps) {
  const style = { '--orb-tint': TINTS[tint], '--orb-size': size } as CSSProperties
  return <div aria-hidden="true" className={cn(styles.orb, className)} style={style} />
}
