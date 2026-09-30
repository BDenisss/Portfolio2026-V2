'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/presentation/lib/gsap'

const LERP = 0.1
const MS_PER_SECOND = 1000

/** Lenis piloté par le ticker GSAP ; coupé sous `prefers-reduced-motion`. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: false, lerp: LERP, anchors: true })
    const tick = (time: number): void => lenis.raf(time * MS_PER_SECOND)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
  return null
}
