'use client'
import { gsap, ScrollTrigger, SplitText } from '@/presentation/lib/gsap'

/**
 * Animations de texte (GSAP SplitText), déclenchées quand le texte arrive à l'écran :
 * - `chars` : lettre par lettre (sur-titres) ;
 * - `mask`  : chaque mot monte derrière un masque (titres) ;
 * - `words` : mot par mot, en fondu (paragraphes).
 * Les lecteurs d'écran lisent une copie invisible du texte entier ; les morceaux animés leur sont masqués
 * (l'aria-label que pose SplitText est interdit sur un <p>).
 */
export type SplitMode = 'chars' | 'mask' | 'words'

const SPLIT_START = 'top 85%'

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
  words: (split) =>
    gsap.from(split.words, {
      opacity: 0,
      y: 12,
      filter: 'blur(6px)',
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.045,
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

/** Découpe chaque `[data-split]` et lance son animation à son arrivée à l'écran (une seule fois). */
export function revealSplitText(elements: HTMLElement[]): void {
  for (const element of elements) {
    const mode = element.dataset.split
    if (!isSplitMode(mode)) continue
    const tween = TWEENS[mode](splitOf(element, mode)) // en pause : l'état de départ est déjà posé
    const delay = Number(element.dataset.splitDelay ?? 0)
    element.classList.add('split-ready') // on peut lever le masquage CSS sans flash
    ScrollTrigger.create({
      trigger: element,
      start: SPLIT_START,
      once: true,
      onEnter: () => gsap.delayedCall(delay, () => tween.play()),
    })
  }
}
