const TINTS = ['amber', 'violet', 'blue', 'teal'] as const

const HASH_MULTIPLIER = 31
const HASH_SHIFT = 3
const ANGLE_BASE = 120
const ANGLE_STEP = 15
const ANGLE_VARIANTS = 5

export type CoverGradient = { from: string; to: string; angle: number }

const tintToken = (index: number): string => `var(--tint-${TINTS[index % TINTS.length]})`

function hashOf(slug: string): number {
  let hash = 0
  for (const char of slug) hash = (hash * HASH_MULTIPLIER + char.charCodeAt(0)) >>> 0
  return hash
}

/** Dégradé de secours déterministe (même slug → même cover) pour un projet sans image. */
export function coverGradient(slug: string): CoverGradient {
  const hash = hashOf(slug)
  const from = hash % TINTS.length
  // Décalage de 1 à 3 teintes : la seconde est toujours différente de la première.
  // `>>>` (non signé) : avec `>>`, un hash ≥ 2^31 devient négatif et le décalage pouvait retomber sur 0.
  const to = from + 1 + ((hash >>> HASH_SHIFT) % (TINTS.length - 1))
  return {
    from: tintToken(from),
    to: tintToken(to),
    angle: ANGLE_BASE + (hash % ANGLE_VARIANTS) * ANGLE_STEP,
  }
}
