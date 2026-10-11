'use client'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

const AUTOPLAY_MS = 5500

/** Index de la diapositive dont le centre est le plus proche du centre de la piste. */
function nearestSlide(track: HTMLElement): number {
  const middle = track.scrollLeft + track.clientWidth / 2
  const slides = Array.from(track.querySelectorAll<HTMLElement>('[data-slide]'))
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

/** Index actif lu au défilement de la piste. */
function useActiveSlide(trackRef: RefObject<HTMLElement | null>): number {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setActive(nearestSlide(track)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
    }
  }, [trackRef])
  return active
}

/** Piste à accroche : index actif lu au défilement, navigation, et lecture auto (pause au survol, au focus et sur demande). */
export function useCarousel(count: number) {
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [engaged, setEngaged] = useState(false)
  const last = count - 1

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      const slide = track?.querySelectorAll<HTMLElement>('[data-slide]')[index]
      if (!track || !slide) return
      const left = slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2
      track.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' })
    },
    [reduced],
  )

  const active = useActiveSlide(trackRef)

  const autoplay = playing && !engaged && !reduced
  useEffect(() => {
    if (!autoplay) return
    const timer = window.setInterval(() => goTo(active === last ? 0 : active + 1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [autoplay, active, last, goTo])

  return {
    trackRef,
    active,
    autoplay,
    reduced,
    playing,
    setEngaged,
    togglePlaying: () => setPlaying((value) => !value),
    goTo,
    previous: () => goTo(active === 0 ? last : active - 1),
    next: () => goTo(active === last ? 0 : active + 1),
  }
}
