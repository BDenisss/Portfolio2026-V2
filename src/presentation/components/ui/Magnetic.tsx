'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/presentation/lib/gsap'

const PULL_FACTOR = 0.3
const MAX_OFFSET_PX = 10
const SETTLE_SECONDS = 0.4

const clamp = (value: number): number => Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, value))

const isMotionAllowed = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !window.matchMedia('(pointer: coarse)').matches

/** Attire légèrement l'élément vers le pointeur. À réserver à UN seul élément focal par page. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !isMotionAllowed()) return
    const moveX = gsap.quickTo(element, 'x', { duration: SETTLE_SECONDS, ease: 'power3' })
    const moveY = gsap.quickTo(element, 'y', { duration: SETTLE_SECONDS, ease: 'power3' })

    const handlePointerMove = (event: PointerEvent): void => {
      const bounds = element.getBoundingClientRect()
      moveX(clamp((event.clientX - (bounds.left + bounds.width / 2)) * PULL_FACTOR))
      moveY(clamp((event.clientY - (bounds.top + bounds.height / 2)) * PULL_FACTOR))
    }
    const handlePointerLeave = (): void => {
      moveX(0)
      moveY(0)
    }

    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <span ref={ref} className="inline-flex">
      {children}
    </span>
  )
}
