import { type GlassStretch, RESTING, stretchFrom } from '@/presentation/lib/glass-stretch'
import { gsap } from '@/presentation/lib/gsap'
import { createRippleController } from './glass-ripple'

const GLASS = '.glass'
const PERCENT = 100
const FOLLOW = { duration: 0.35, ease: 'power3.out' }
// Retour élastique : le verre dépasse un peu sa forme de repos puis s'y pose, comme une goutte.
const SETTLE = { duration: 0.9, ease: 'elastic.out(1, 0.45)' }

type Pointer = { readonly x: number; readonly y: number }

const isStretchable = (glass: HTMLElement): boolean => glass.dataset.stretch !== undefined
// Le simple biseau posé sur un média (cadre de l'avatar) n'est pas une surface qu'on touche.
const TOUCHABLE_GLASS = `${GLASS}:not(.glass--rim)`
// Un clic pour écrire dans un champ ne doit pas faire onduler le formulaire autour.
const TEXT_FIELD = 'input, textarea, select, [contenteditable]'

/** Le verre touché (le plus proche du point de clic), sauf quand on clique dans un champ de saisie. */
function touchedGlass(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element) || target.closest(TEXT_FIELD)) return null
  return target.closest<HTMLElement>(TOUCHABLE_GLASS)
}

/** Les verres sous un point, du plus proche au plus lointain : un bouton posé dans une carte, les deux brillent. */
function glassChainAt({ x, y }: Pointer): HTMLElement[] {
  const chain: HTMLElement[] = []
  let glass = document.elementFromPoint(x, y)?.closest<HTMLElement>(GLASS) ?? null
  while (glass) {
    chain.push(glass)
    glass = glass.parentElement?.closest<HTMLElement>(GLASS) ?? null
  }
  return chain
}

function ratioIn(glass: HTMLElement, { x, y }: Pointer): Pointer {
  const box = glass.getBoundingClientRect()
  return { x: (x - box.left) / box.width, y: (y - box.top) / box.height }
}

function shape(glass: HTMLElement, state: GlassStretch, timing: gsap.TweenVars): void {
  gsap.to(glass, { ...state, ...timing, overwrite: 'auto' })
}

/** Retour au repos ; une fois posé, le verre rend la main au CSS. */
function settle(glass: HTMLElement): void {
  shape(glass, RESTING, { ...SETTLE, clearProps: 'transform' })
}

/** Reflet (et étirement des petits verres) qui suit le pointeur au-dessus d'un verre. */
function light(glass: HTMLElement, pointer: Pointer): void {
  const ratio = ratioIn(glass, pointer)
  glass.style.setProperty('--glass-mx', `${(ratio.x * PERCENT).toFixed(1)}%`)
  glass.style.setProperty('--glass-my', `${(ratio.y * PERCENT).toFixed(1)}%`)
  glass.dataset.glassLit = ''
  if (isStretchable(glass)) shape(glass, stretchFrom(ratio.x, ratio.y), FOLLOW)
}

function unlight(glass: HTMLElement): void {
  delete glass.dataset.glassLit
  if (isStretchable(glass)) settle(glass)
}

/** Écouteur passif ; renvoie de quoi le retirer. */
function listen<E extends Event>(
  target: EventTarget,
  type: string,
  handler: (event: E) => void,
): () => void {
  const listener = handler as EventListener
  target.addEventListener(type, listener, { passive: true })
  return () => target.removeEventListener(type, listener)
}

/**
 * Verre vivant au pointeur : un reflet suit la souris sur toutes les surfaces en verre, et les petits éléments
 * (`data-stretch`) s'étirent vers elle. Au clic, une onde part du point touché sur tout verre, et les petits
 * rebondissent en plus (glass-ripple).
 * Renvoie le nettoyage. `hover` : souris ou stylet (au doigt, il ne reste que l'onde au toucher).
 */
export function startGlassHover({ hover }: { hover: boolean }): () => void {
  let lit = new Set<HTMLElement>()
  let pointer: Pointer | null = null
  let frame = 0

  const update = (): void => {
    frame = 0
    const chain = pointer ? glassChainAt(pointer) : []
    for (const glass of lit) if (!chain.includes(glass)) unlight(glass)
    if (pointer) for (const glass of chain) light(glass, pointer)
    lit = new Set(chain)
  }
  const schedule = (): void => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  const track = (next: Pointer | null): void => {
    pointer = next
    schedule()
  }
  const ripples = createRippleController()

  const stops = [
    listen<PointerEvent>(document, 'pointerdown', (event) => {
      const glass = touchedGlass(event.target)
      if (glass) ripples.press(glass, event.clientX, event.clientY, isStretchable(glass))
    }),
    listen(document, 'pointerup', ripples.release),
    listen(document, 'pointercancel', ripples.release),
    ...(hover
      ? [
          listen<PointerEvent>(document, 'pointermove', (event) => {
            if (event.pointerType !== 'touch') track({ x: event.clientX, y: event.clientY })
          }),
          listen(document.documentElement, 'pointerleave', () => track(null)),
          listen(window, 'scroll', schedule), // la page défile sous une souris immobile
        ]
      : []),
  ]
  return () => {
    cancelAnimationFrame(frame)
    for (const stop of stops) stop()
    ripples.stop()
    for (const glass of lit) unlight(glass)
  }
}
