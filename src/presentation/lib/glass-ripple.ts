/**
 * Clic liquide du verre (démo « C · Onde », réglée à raideur ×2 et amortissement ×1,5) : au clic, une onde part du
 * point touché en ralentissant et en s'éteignant ; les petits verres encaissent en plus le choc sur un ressort amorti.
 */

/** Pas de temps fixe de la simulation : plusieurs sous-pas par image, pour un ressort stable. */
export const RIPPLE_STEP = 1 / 240

// Rebond : ressort amorti (raideur 700 × 2, amortissement 11 × 1,5). L'appui donne une impulsion vers l'intérieur
// et maintient le verre 4 % plus petit ; au relâchement, il oscille un peu autour de sa taille avant de s'y poser.
const BUMP_STIFFNESS = 1400
const BUMP_DAMPING = 16.5
const BUMP_IMPULSE = 1.6
const PRESSED_DEPTH = 0.04
const SETTLED_OFFSET = 1e-4
const SETTLED_VELOCITY = 1e-3

/** Écart d'échelle du verre (0 au repos, négatif quand il rentre) et sa vitesse. */
export type Bump = { readonly offset: number; readonly velocity: number }

export const BUMP_REST: Bump = { offset: 0, velocity: 0 }

export const pressBump = (bump: Bump): Bump => ({ ...bump, velocity: bump.velocity - BUMP_IMPULSE })

export function stepBump(bump: Bump, pressed: boolean, seconds = RIPPLE_STEP): Bump {
  const target = pressed ? -PRESSED_DEPTH : 0
  const force = -BUMP_STIFFNESS * (bump.offset - target) - BUMP_DAMPING * bump.velocity
  const velocity = bump.velocity + force * seconds
  return { offset: bump.offset + velocity * seconds, velocity }
}

export const isBumpSettled = (bump: Bump, pressed: boolean): boolean =>
  !pressed && Math.abs(bump.offset) < SETTLED_OFFSET && Math.abs(bump.velocity) < SETTLED_VELOCITY

// Onde : son diamètre tend vers 2,6 fois la largeur du verre (r = R·(1 − e^(−t/τ)), elle ralentit en s'éloignant),
// sa réfraction et son anneau de lumière s'éteignent de façon exponentielle. La largeur prise en compte plafonne
// à 240 px : sur une grande carte, l'onde garde la vitesse et la portée qu'elle a sur un bouton.
const WAVE_REACH = 2.6
const WAVE_MAX_WIDTH = 240
const WAVE_SPREAD_SECONDS = 0.3
const WAVE_FADE_SECONDS = 0.42
const RING_FADE_SECONDS = 0.38
const MAX_REFRACTION = 0.3

/** Au-delà, l'onde n'est plus visible (réfraction et anneau sous 2 %) : on peut la retirer. */
export const WAVE_SECONDS = 1.6

export type Wave = {
  readonly diameter: number
  readonly refraction: number
  readonly ringOpacity: number
}

export function waveAt(seconds: number, width: number): Wave {
  return {
    diameter:
      WAVE_REACH * Math.min(width, WAVE_MAX_WIDTH) * (1 - Math.exp(-seconds / WAVE_SPREAD_SECONDS)),
    refraction: MAX_REFRACTION * Math.exp(-seconds / WAVE_FADE_SECONDS),
    ringOpacity: Math.exp(-seconds / RING_FADE_SECONDS),
  }
}

const NEUTRAL = 128
const CHANNEL = 127
const OPAQUE = 255
const CHANNELS = 4
// Crête (de 62 à 98 % du rayon) qui pousse le fond vers l'extérieur, creux juste derrière qui le tire vers le centre.
const CREST = { from: 0.62, to: 0.98 }
const TROUGH = { from: 0.36, to: 0.62, weight: 0.45 }

const band = (distance: number, { from, to }: { from: number; to: number }): number =>
  distance > from && distance < to ? Math.sin((Math.PI * (distance - from)) / (to - from)) : 0

const amplitudeAt = (distance: number): number =>
  band(distance, CREST) - TROUGH.weight * band(distance, TROUGH)

/**
 * Carte de déplacement de l'onde (pixels RGBA, `size` × `size`) pour `feDisplacementMap` : le rouge décale
 * horizontalement, le vert verticalement, 128 ne décale rien (centre et coins).
 */
export function rippleMap(size: number): Uint8ClampedArray<ArrayBuffer> {
  const pixels = new Uint8ClampedArray(size * size * CHANNELS)
  const radius = size / 2
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const dx = (column + 0.5 - radius) / radius
      const dy = (row + 0.5 - radius) / radius
      const distance = Math.hypot(dx, dy)
      const push = distance > 0 && distance < 1 ? amplitudeAt(distance) / distance : 0
      const index = (row * size + column) * CHANNELS
      pixels[index] = Math.round(NEUTRAL + dx * push * CHANNEL)
      pixels[index + 1] = Math.round(NEUTRAL + dy * push * CHANNEL)
      pixels[index + 2] = NEUTRAL
      pixels[index + 3] = OPAQUE
    }
  }
  return pixels
}
