'use client'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { wrapIndex } from '@/presentation/lib/carousel'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

const AUTOPLAY_MS = 6000
const VISIBLE_RATIO = 0.5

/** Vrai tant que le carrousel est au moins à moitié visible : il ne tourne jamais hors écran. */
function useInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: VISIBLE_RATIO },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

function useAutoplay(advance: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const timer = window.setInterval(advance, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [advance, enabled])
}

/**
 * État du carrousel : diapositive active en boucle et rotation automatique.
 * La rotation s'arrête au survol, au focus, hors écran, sous mouvement réduit, et dès que la personne navigue elle-même.
 */
export function useCarousel(count: number) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const advance = useCallback(() => setActive((index) => wrapIndex(index + 1, count)), [count])
  const rotating = playing && !reduced && inView && !hovered && !focused
  useAutoplay(advance, rotating)

  const goTo = useCallback(
    (index: number) => {
      setPlaying(false)
      setActive(wrapIndex(index, count))
    },
    [count],
  )

  return {
    rootRef,
    active,
    playing: playing && !reduced,
    rotating,
    reduced,
    setHovered,
    setFocused,
    goTo,
    next: () => goTo(active + 1),
    previous: () => goTo(active - 1),
    togglePlaying: () => setPlaying((value) => !value),
  }
}
