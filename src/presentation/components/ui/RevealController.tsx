'use client'
import { usePathname } from '@/presentation/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/presentation/lib/gsap'

const TRIGGER_START = 'top 92%'
const REVEAL_SECONDS = 0.6
const STAGGER_SECONDS = 0.08

/** Révèle les blocs `.reveal` à l'entrée dans le viewport, sauf sous `prefers-reduced-motion` (état final immédiat). */
export function RevealController() {
  const pathname = usePathname()
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        try {
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
        } catch {
          gsap.set(items, { clearProps: 'all' }) // échec GSAP : le contenu doit rester visible
        }
      })
      return () => media.revert()
    },
    { dependencies: [pathname] },
  )
  return null
}
