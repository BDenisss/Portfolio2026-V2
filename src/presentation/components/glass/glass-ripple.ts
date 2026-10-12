import {
  type Bump,
  BUMP_REST,
  isBumpSettled,
  pressBump,
  RIPPLE_STEP,
  rippleMap,
  stepBump,
  WAVE_SECONDS,
  waveAt,
} from '@/presentation/lib/glass-ripple'

const MAP_SIZE = 256
const MAX_FRAME_SECONDS = 0.1
// Filtre de réfraction de l'onde, déclaré dans <GlassFilters/> (Chromium seulement, via `backdrop-filter`).
const MAP_ID = 'lg-ripple-map'
const DISPLACEMENT_ID = 'lg-ripple-displacement'

type Ripple = {
  readonly layer: HTMLElement
  readonly wave: HTMLElement
  readonly ring: HTMLElement
  x: number
  y: number
  seconds: number
  bump: Bump
  pressed: boolean
}

/** Peint une seule fois la carte de l'onde dans le filtre (calculée ici plutôt que stockée en image). */
function paintMap(): void {
  const image = document.getElementById(MAP_ID)
  if (!image || image.hasAttribute('href')) return
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = MAP_SIZE
  canvas.getContext('2d')?.putImageData(new ImageData(rippleMap(MAP_SIZE), MAP_SIZE), 0, 0)
  image.setAttribute('href', canvas.toDataURL())
}

const span = (className: string): HTMLElement => {
  const element = document.createElement('span')
  element.className = className
  return element
}

/** Couche de l'onde, glissée sous le texte du verre le temps de l'animation, puis retirée. */
function createRipple(glass: HTMLElement): Ripple {
  const layer = span('glass-ripple')
  const wave = span('glass-ripple__wave')
  const ring = span('glass-ripple__ring')
  layer.setAttribute('aria-hidden', 'true')
  layer.append(wave, ring)
  glass.append(layer)
  return { layer, wave, ring, x: 0, y: 0, seconds: 0, bump: BUMP_REST, pressed: false }
}

function draw(glass: HTMLElement, ripple: Ripple): number {
  const { diameter, refraction, ringOpacity } = waveAt(ripple.seconds, glass.offsetWidth)
  for (const circle of [ripple.wave, ripple.ring]) {
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${ripple.x - diameter / 2}px`
    circle.style.top = `${ripple.y - diameter / 2}px`
  }
  ripple.ring.style.opacity = ringOpacity.toFixed(3)
  glass.style.scale = (1 + ripple.bump.offset).toFixed(4)
  return refraction
}

const isOver = (ripple: Ripple): boolean =>
  ripple.seconds > WAVE_SECONDS && isBumpSettled(ripple.bump, ripple.pressed)

/** Avance la simulation d'un nombre entier de pas fixes. */
function advance(ripple: Ripple, seconds: number): void {
  for (let left = seconds; left >= RIPPLE_STEP; left -= RIPPLE_STEP) {
    ripple.bump = stepBump(ripple.bump, ripple.pressed)
    ripple.seconds += RIPPLE_STEP
  }
}

/** Nouvel appui : l'onde repart du point touché et le verre reçoit son impulsion. */
function strike(glass: HTMLElement, ripple: Ripple, clientX: number, clientY: number): void {
  const box = glass.getBoundingClientRect()
  ripple.x = clientX - box.left
  ripple.y = clientY - box.top
  ripple.seconds = 0
  ripple.pressed = true
  ripple.bump = pressBump(ripple.bump)
}

function remove(glass: HTMLElement, ripple: Ripple): void {
  ripple.layer.remove()
  glass.style.removeProperty('scale')
}

export type RippleController = {
  press: (glass: HTMLElement, clientX: number, clientY: number) => void
  release: () => void
  stop: () => void
}

/** Ondes et rebonds des petits verres : une boucle d'images tant qu'une onde est en cours, rien sinon. */
export function createRippleController(): RippleController {
  const ripples = new Map<HTMLElement, Ripple>()
  const displacement = document.getElementById(DISPLACEMENT_ID)
  let frame = 0
  let last = 0
  let pending = 0

  const tick = (now: number): void => {
    pending = Math.min(pending + (now - last) / 1000, MAX_FRAME_SECONDS)
    last = now
    let refraction = 0
    for (const [glass, ripple] of ripples) {
      advance(ripple, pending)
      refraction = Math.max(refraction, draw(glass, ripple))
      if (isOver(ripple)) {
        remove(glass, ripple)
        ripples.delete(glass)
      }
    }
    pending %= RIPPLE_STEP
    displacement?.setAttribute('scale', (ripples.size > 0 ? refraction : 0).toFixed(4))
    frame = ripples.size > 0 ? requestAnimationFrame(tick) : 0
  }

  return {
    press(glass, clientX, clientY) {
      paintMap()
      const ripple = ripples.get(glass) ?? createRipple(glass)
      strike(glass, ripple, clientX, clientY)
      ripples.set(glass, ripple)
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    },
    release() {
      for (const ripple of ripples.values()) ripple.pressed = false
    },
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
      for (const [glass, ripple] of ripples) remove(glass, ripple)
      ripples.clear()
      displacement?.setAttribute('scale', '0')
    },
  }
}
