/** Déformation d'un petit élément en verre : décalage (px) et échelles horizontale et verticale. */
export type GlassStretch = {
  readonly x: number
  readonly y: number
  readonly scaleX: number
  readonly scaleY: number
}

// Le verre glisse d'au plus 6 px vers le pointeur, s'allonge d'au plus 4,5 % dans sa direction et se resserre
// d'au plus 1,5 % dans l'autre : assez pour sentir la matière, trop peu pour gêner la lecture.
const MAX_SHIFT_PX = 6
const STRETCH = 0.09
const SQUASH = 0.03
const CENTER = 0.5

export const RESTING: GlassStretch = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1)

/** Étirement vers le pointeur, à partir de sa position dans l'élément (0 → 1 sur chaque axe). */
export function stretchFrom(ratioX: number, ratioY: number): GlassStretch {
  const dx = clamp01(ratioX) - CENTER
  const dy = clamp01(ratioY) - CENTER
  return {
    x: (dx / CENTER) * MAX_SHIFT_PX,
    y: (dy / CENTER) * MAX_SHIFT_PX,
    scaleX: 1 + Math.abs(dx) * STRETCH - Math.abs(dy) * SQUASH,
    scaleY: 1 + Math.abs(dy) * STRETCH - Math.abs(dx) * SQUASH,
  }
}
