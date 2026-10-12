import { gsap } from '@/presentation/lib/gsap'
import { type GlassStretch, PRESSED, RESTING, stretchFrom } from '@/presentation/lib/glass-stretch'

const GLASS = '.glass'
const PERCENT = 100
const FOLLOW = { duration: 0.35, ease: 'power3.out' }
const PRESS = { duration: 0.15, ease: 'power2.out' }
// Retour élastique : le verre dépasse un peu sa forme de repos puis s'y pose, comme une goutte.
const SETTLE = { duration: 0.9, ease: 'elastic.out(1, 0.45)' }

type Pointer = { readonly x: number; readonly y: number }

const isStretchable = (glass: HTMLElement): boolean => glass.dataset.stretch !== undefined
const isPressed = (glass: HTMLElement): boolean => glass.dataset.glassPressed !== undefined

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

/** Retour au repos ; une fois posé, le verre rend la main au CSS (survol, appui sans souris). */
function settle(glass: HTMLElement): void {
  shape(glass, RESTING, { ...SETTLE, clearProps: 'transform' })
}

/** Reflet (et étirement des petits verres) qui suit le pointeur au-dessus d'un verre. */
function light(glass: HTMLElement, pointer: Pointer): void {
  const ratio = ratioIn(glass, pointer)
  glass.style.setProperty('--glass-mx', `${(ratio.x * PERCENT).toFixed(1)}%`)
  glass.style.setProperty('--glass-my', `${(ratio.y * PERCENT).toFixed(1)}%`)
  glass.dataset.glassLit = ''
  if (isStretchable(glass) && !isPressed(glass)) shape(glass, stretchFrom(ratio.x, ratio.y), FOLLOW)
}

function unlight(glass: HTMLElement): void {
  delete glass.dataset.glassLit
  if (isStretchable(glass) && !isPressed(glass)) settle(glass)
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

/** Appui sur un petit verre : il s'écrase sur place. */
function press(event: PointerEvent): void {
  const glass = (event.target as Element | null)?.closest<HTMLElement>(`${GLASS}[data-stretch]`)
  if (!glass) return
  glass.dataset.glassPressed = ''
  shape(glass, PRESSED, PRESS)
}

/** Relâchement : rebond vers l'étirement sous la souris si elle est encore dessus, sinon vers le repos. */
function release(pointer: Pointer | null, lit: ReadonlySet<HTMLElement>): void {
  for (const glass of document.querySelectorAll<HTMLElement>('[data-glass-pressed]')) {
    delete glass.dataset.glassPressed
    if (pointer && lit.has(glass)) {
      const ratio = ratioIn(glass, pointer)
      shape(glass, stretchFrom(ratio.x, ratio.y), SETTLE)
    } else settle(glass)
  }
}

/**
 * Verre vivant au pointeur : un reflet suit la souris sur toutes les surfaces en verre, et les petits éléments
 * (`data-stretch`) s'étirent vers elle, s'écrasent à l'appui et reviennent avec un rebond. Renvoie le nettoyage.
 * `hover` : souris ou stylet (au doigt, il n'y a que l'écrasement à l'appui).
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
  const onRelease = (): void => release(pointer, lit)

  const stops = [
    listen(document, 'pointerdown', press),
    listen(document, 'pointerup', onRelease),
    listen(document, 'pointercancel', onRelease),
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
    for (const glass of lit) unlight(glass)
  }
}
