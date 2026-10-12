'use client'
import { gsap, SplitText } from '@/presentation/lib/gsap'

/**
 * Animations de texte (GSAP SplitText), déclenchées quand le texte arrive à l'écran :
 * - `chars` : lettre par lettre (sur-titres) ;
 * - `mask`  : chaque mot monte derrière un masque (titres) ;
 * - `words` : mot par mot, en fondu (paragraphes).
 * Les lecteurs d'écran lisent une copie invisible du texte entier ; les morceaux animés leur sont masqués
 * (l'aria-label que pose SplitText est interdit sur un <p>).
 */
export type SplitMode = 'chars' | 'mask' | 'words'

// Lecture quand le haut du texte passe la ligne des 85 % de l'écran (bas rogné de 15 %).
const PLAY_MARGIN = '0px 0px -15% 0px'
// Découpage 200 px avant l'entrée à l'écran : le texte est déjà masqué quand il devient visible.
const PREPARE_MARGIN = '0px 0px 200px 0px'

const TWEENS: Record<SplitMode, (split: SplitText) => gsap.core.Tween> = {
  chars: (split) =>
    gsap.from(split.chars, {
      opacity: 0,
      y: '0.6em',
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.03,
      paused: true,
    }),
  mask: (split) =>
    gsap.from(split.words, {
      yPercent: 110,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.14,
      paused: true,
    }),
  // Pas de `filter: blur()` ici : un flou animé se redessine à chaque image sur chaque mot (31 mots
  // pour l'accroche du hero) et saccade ; opacité + déplacement restent sur la carte graphique.
  words: (split) =>
    gsap.from(split.words, {
      opacity: 0,
      yPercent: 35,
      duration: 0.55,
      ease: 'power2.out',
      stagger: 0.03,
      paused: true,
    }),
}

const isSplitMode = (value: string | undefined): value is SplitMode =>
  value === 'chars' || value === 'mask' || value === 'words'

function splitOf(element: HTMLElement, mode: SplitMode): SplitText {
  const text = element.textContent ?? ''
  const split = SplitText.create(element, {
    type: mode === 'chars' ? 'words,chars' : 'words',
    mask: mode === 'mask' ? 'words' : undefined,
    wordsClass: 'split-word',
    aria: 'none',
  })
  for (const piece of mode === 'mask' ? split.masks : split.words)
    piece.setAttribute('aria-hidden', 'true')
  const copy = document.createElement('span')
  copy.className = 'sr-only'
  copy.textContent = text
  element.append(copy)
  return split
}

const clipsTextToBackground = (style: CSSStyleDeclaration): boolean =>
  style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text'

/**
 * Texte en dégradé (`bg-clip-text`) : une fois découpé, les mots déplacés sortent du découpage de leur parent
 * et deviendraient invisibles. Chaque mot reçoit donc le dégradé, calé sur sa position pour qu'il reste continu.
 * Renvoie de quoi rendre le dégradé au parent une fois l'animation terminée.
 */
function carryGradientText(element: HTMLElement, split: SplitText): () => void {
  const style = getComputedStyle(element)
  if (!clipsTextToBackground(style)) return () => undefined
  const box = element.getBoundingClientRect()
  for (const word of split.words as HTMLElement[]) {
    const rect = word.getBoundingClientRect()
    word.style.backgroundImage = style.backgroundImage
    word.style.backgroundSize = `${box.width}px ${box.height}px`
    word.style.backgroundPosition = `${box.left - rect.left}px ${box.top - rect.top}px`
    word.style.backgroundRepeat = 'no-repeat'
    word.style.setProperty('-webkit-background-clip', 'text')
    word.style.backgroundClip = 'text'
  }
  element.style.backgroundImage = 'none'
  return () => element.style.removeProperty('background-image')
}

/** Découpe le texte et prépare son animation, en pause : l'état de départ est posé tout de suite. */
function prepareSplit(element: HTMLElement, mode: SplitMode): gsap.core.Tween {
  const split = splitOf(element, mode)
  const restoreGradient = carryGradientText(element, split) // mesuré avant que le tween ne décale les mots
  const tween = TWEENS[mode](split)
  // Une fois joué, on rend le texte d'origine : moins de nœuds et de calques pour le reste de la visite.
  tween.eventCallback('onComplete', () => {
    split.revert()
    restoreGradient()
  })
  element.classList.add('split-ready') // on peut lever le masquage CSS sans flash
  return tween
}

/** Appelle `onEnter` une seule fois par élément quand il croise la zone donnée (ou s'il est déjà au-dessus). */
function observeOnce(
  elements: HTMLElement[],
  rootMargin: string,
  onEnter: (element: HTMLElement) => void,
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) continue
        observer.unobserve(entry.target)
        onEnter(entry.target as HTMLElement)
      }
    },
    { rootMargin },
  )
  for (const element of elements) observer.observe(element)
  return observer
}

/**
 * Anime chaque `[data-split]` à son arrivée à l'écran (une seule fois). Le découpage est paresseux : il se fait
 * juste avant que le texte n'apparaisse, pas au chargement, pour ne pas alourdir l'intro du hero avec les titres
 * de toutes les sections. Deux IntersectionObserver partagés plutôt qu'un ScrollTrigger par texte : rien à
 * mesurer sur le fil principal, ni au chargement ni à chaque `ScrollTrigger.refresh()`.
 * Renvoie la fonction de nettoyage des observateurs.
 */
export function revealSplitText(
  elements: HTMLElement[],
  track: (work: () => void) => void = (work) => work(),
): () => void {
  const tweens = new Map<HTMLElement, gsap.core.Tween>()
  const prepare = (element: HTMLElement): gsap.core.Tween | null => {
    const mode = element.dataset.split
    if (!isSplitMode(mode)) return null
    const existing = tweens.get(element)
    if (existing) return existing
    // `track` rattache découpe et animation au contexte GSAP : elles seront annulées avec lui.
    track(() => tweens.set(element, prepareSplit(element, mode)))
    return tweens.get(element) ?? null
  }
  const preparing = observeOnce(elements, PREPARE_MARGIN, (element) => void prepare(element))
  const playing = observeOnce(elements, PLAY_MARGIN, (element) => {
    const tween = prepare(element)
    gsap.delayedCall(Number(element.dataset.splitDelay ?? 0), () => tween?.play())
  })
  return () => {
    preparing.disconnect()
    playing.disconnect()
  }
}
