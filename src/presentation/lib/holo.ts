/** État de l'effet holographique d'une carte pour une position du pointeur (en pourcentages ou en degrés). */
export type HoloState = {
  readonly rotateX: number
  readonly rotateY: number
  readonly shineX: number
  readonly shineY: number
  readonly sparkX: number
  readonly sparkY: number
  readonly sparkOpacity: number
}

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1)

/**
 * Calcul de l'effet « carte holographique » (d'après le pen de Simon Goellner, simeydotme) : à partir de la
 * position du pointeur dans la carte (0 → 1 sur chaque axe), l'inclinaison 3D, la position du reflet coloré
 * et celle des paillettes, dont l'éclat augmente vers les coins.
 */
export function holoFrom(ratioX: number, ratioY: number): HoloState {
  const px = Math.abs(Math.floor(clamp01(ratioX) * 100) - 100)
  const py = Math.abs(Math.floor(clamp01(ratioY) * 100) - 100)
  const fromCenter = 50 - px + (50 - py)
  const shineX = 50 + (px - 50) / 1.5
  const shineY = 50 + (py - 50) / 1.5
  return {
    rotateX: -(shineY - 50) / 2,
    rotateY: ((shineX - 50) / 1.5) * 0.5,
    shineX,
    shineY,
    sparkX: 50 + (px - 50) / 7,
    sparkY: 50 + (py - 50) / 7,
    sparkOpacity: Math.min((20 + Math.abs(fromCenter) * 1.5) / 100, 1),
  }
}
