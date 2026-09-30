'use client'
import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/presentation/lib/gsap'

const DESKTOP_MOTION = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
const MOBILE_MOTION = '(max-width: 767px) and (prefers-reduced-motion: no-preference)'
const PIN_SCROLL_DISTANCE = '+=120%'
const FRAME_END_SCALE = 0.9
const CHIP_DESKTOP_LIFT = -30
const CHIP_MOBILE_LIFT = -20
const COPY_LIFT = -6
const CHIP_STAGGER = 0.05
const SCRUB_SMOOTHING = 1

type HeroMotionProps = { children: ReactNode; className?: string }

/** Scroll du hero : pin + transition scrubée sur desktop uniquement, simple parallax du décor sur mobile. */
export function HeroMotion({ children, className }: HeroMotionProps) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(DESKTOP_MOTION, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: PIN_SCROLL_DISTANCE,
              scrub: SCRUB_SMOOTHING,
              pin: true,
              anticipatePin: 1,
            },
          })
          .to('[data-hero-frame]', { scale: FRAME_END_SCALE, ease: 'none' }, 0)
          .to(
            '[data-hero-chip]',
            { yPercent: CHIP_DESKTOP_LIFT, stagger: CHIP_STAGGER, ease: 'none' },
            0,
          )
          .to('[data-hero-copy]', { yPercent: COPY_LIFT, ease: 'none' }, 0)
      })
      media.add(MOBILE_MOTION, () => {
        gsap.to('[data-hero-chip]', {
          yPercent: CHIP_MOBILE_LIFT,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: SCRUB_SMOOTHING,
          },
        })
      })
      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <section
      id="hero"
      ref={root}
      data-section="hero"
      aria-labelledby="hero-title"
      className={className}
    >
      {children}
    </section>
  )
}
