'use client'
import { useEffect } from 'react'
import { usePathname } from '@/presentation/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/presentation/lib/gsap'
import { revealSplitText } from './split-reveal'

const TRIGGER_START = 'top 92%'
const REVEAL_SECONDS = 0.6
const STAGGER_SECONDS = 0.08
// Entrées par la droite : liées au scroll, chacune démarre quand son haut atteint le bas de l'écran
// et finit en place au milieu de l'écran. Elles arrivent donc une par une, au rythme du défilement.
const SCRUB_START = 'top 95%'
const SCRUB_END = 'top 45%'
const SCRUB_SMOOTHING = 0.6

/** Blocs `.reveal` classiques : révélés une fois, par lots, à l'entrée dans le viewport. */
function revealOnEnter(items: HTMLElement[]): void {
  ScrollTrigger.batch(items, {
    start: TRIGGER_START,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: REVEAL_SECONDS,
        ease: 'power3.out',
        stagger: STAGGER_SECONDS,
        overwrite: true,
      }),
  })
}

/** Blocs `data-reveal="right"` : glissent depuis la droite en fondu, en suivant le scroll. */
function revealFromRightOnScroll(items: HTMLElement[]): void {
  for (const item of items) {
    gsap.to(item, {
      opacity: 1,
      x: 0,
      ease: 'power2.out',
      scrollTrigger: { trigger: item, start: SCRUB_START, end: SCRUB_END, scrub: SCRUB_SMOOTHING },
    })
  }
}

const REFRESH_DEBOUNCE_MS = 150

/**
 * Les positions des déclencheurs sont mesurées à leur création ; si la page grandit ensuite (médias, polices,
 * carrousel, CMS), elles deviennent fausses et les animations se jouent hors écran. On les remesure à chaque
 * changement de hauteur de la page.
 */
function useRefreshOnResize(): void {
  useEffect(() => {
    let timer = 0
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        ScrollTrigger.sort() // ordre de la page : un épinglage plus haut décale bien les déclencheurs plus bas
        ScrollTrigger.refresh()
      }, REFRESH_DEBOUNCE_MS)
    })
    observer.observe(document.body)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])
}

/** Révèle les blocs `.reveal` au scroll, sauf sous `prefers-reduced-motion` (état final immédiat). */
export function RevealController() {
  const pathname = usePathname()
  useRefreshOnResize()
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        try {
          revealOnEnter(items.filter((item) => item.dataset.reveal !== 'right'))
          revealFromRightOnScroll(items.filter((item) => item.dataset.reveal === 'right'))
          revealSplitText(gsap.utils.toArray<HTMLElement>('[data-split]'))
        } catch {
          // échec GSAP : le contenu doit rester visible
          gsap.set(items, { clearProps: 'all' })
          document
            .querySelectorAll('[data-split]')
            .forEach((element) => element.classList.add('split-ready'))
        }
      })
      return () => media.revert()
    },
    { dependencies: [pathname] },
  )
  return null
}
