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

// Pointe du tracé : à la hauteur où les cartes finissent d'arriver (SCRUB_END), pour que chaque carte se pose
// juste avant que la ligne n'atteigne sa pastille.
const DRAW_TIP = '45%'
const DOT_POP_SECONDS = 0.4

/**
 * Position d'un point d'un élément tracé, mesurée dans la mise en page de son parent : l'élément est écrasé à zéro
 * avant son tracé, et sa boîte à l'écran ne donnerait pas sa vraie hauteur.
 */
const drawPoint =
  (element: HTMLElement, fraction: number): (() => string) =>
  () =>
    `top+=${element.offsetTop + element.offsetHeight * fraction} ${DRAW_TIP}`

/**
 * Rails `data-draw="line"` : chaque segment se trace au scroll, sa pointe suivant la même hauteur d'écran ; les
 * segments se touchent, donc la ligne paraît continue. Pastilles `data-draw="dot"` : elles apparaissent quand la
 * pointe les atteint et disparaissent en remontant.
 */
function drawOnScroll(lines: HTMLElement[], dots: HTMLElement[]): void {
  for (const line of lines) {
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: line.parentElement, // le <li>, qui sert de repère à offsetTop
          start: drawPoint(line, 0),
          end: drawPoint(line, 1),
          scrub: true,
        },
      },
    )
  }
  for (const dot of dots) {
    gsap.fromTo(
      dot,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: DOT_POP_SECONDS,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: dot.parentElement,
          start: drawPoint(dot, 0.5),
          toggleActions: 'play none none reverse',
        },
      },
    )
  }
}

/** Échec GSAP : tout ce qui attendait une animation s'affiche dans son état final. */
function showEverything(items: HTMLElement[]): void {
  gsap.set(items, { clearProps: 'all' })
  document
    .querySelectorAll('[data-split]')
    .forEach((element) => element.classList.add('split-ready'))
  document.querySelectorAll<HTMLElement>('[data-draw]').forEach((element) => {
    element.style.transform = 'none'
    element.style.opacity = '1'
  })
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
        ScrollTrigger.sort() // ordre de la page : les déclencheurs créés tard restent triés avant le recalcul
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
      media.add('(prefers-reduced-motion: no-preference)', (context) => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        let stopSplitText = (): void => undefined
        try {
          revealOnEnter(items.filter((item) => item.dataset.reveal !== 'right'))
          revealFromRightOnScroll(items.filter((item) => item.dataset.reveal === 'right'))
          drawOnScroll(
            gsap.utils.toArray<HTMLElement>('[data-draw="line"]'),
            gsap.utils.toArray<HTMLElement>('[data-draw="dot"]'),
          )
          stopSplitText = revealSplitText(gsap.utils.toArray<HTMLElement>('[data-split]'), (work) =>
            context.add(work),
          )
        } catch {
          showEverything(items) // échec GSAP : le contenu doit rester visible
        }
        return () => stopSplitText()
      })
      return () => media.revert()
    },
    { dependencies: [pathname] },
  )
  return null
}
