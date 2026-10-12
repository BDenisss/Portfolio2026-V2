'use client'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

// Étirement pendant le glissement (pen « Liquid glass ») : + 10 % par cran parcouru, plafonné à + 20 %.
const STRETCH_MS = 440
const STRETCH_PER_STEP = 0.1
const MAX_STRETCH = 0.2

/** Pose la pastille sur l'élément `[data-indicator-key]` actif de son parent ; renvoie son rang, ou -1 s'il n'y en a pas. */
function place(indicator: HTMLElement, key: string | null): number {
  const parent = indicator.parentElement
  if (!parent) return -1
  const targets = Array.from(parent.querySelectorAll<HTMLElement>('[data-indicator-key]'))
  const index = targets.findIndex((target) => target.dataset.indicatorKey === key)
  const target = targets[index]
  if (!target) {
    delete indicator.dataset.visible
    return -1
  }
  const frame = parent.getBoundingClientRect()
  const box = target.getBoundingClientRect()
  indicator.style.setProperty('--indicator-x', `${box.left - frame.left - parent.clientLeft}px`)
  indicator.style.setProperty('--indicator-y', `${box.top - frame.top - parent.clientTop}px`)
  indicator.style.setProperty('--indicator-w', `${box.width}px`)
  indicator.style.setProperty('--indicator-h', `${box.height}px`)
  indicator.dataset.visible = ''
  return index
}

/** La pastille s'étire vers sa destination puis reprend sa forme : l'effet « goutte » du verre liquide. */
function stretch(indicator: HTMLElement, from: number, to: number): void {
  if (from < 0 || to < 0 || from === to) return
  const scale = 1 + Math.min(STRETCH_PER_STEP * Math.abs(to - from), MAX_STRETCH)
  indicator.style.transformOrigin = to > from ? 'left' : 'right'
  indicator.animate([{ scale: '1 1' }, { scale: `${scale} 1` }, { scale: '1 1' }], {
    duration: STRETCH_MS,
    easing: 'ease',
  })
}

/**
 * Pastille de verre qui désigne l'élément actif d'une liste (nav, dock, langue) et y glisse quand il change.
 * À placer dans un parent positionné, à côté des éléments marqués `data-indicator-key` (eux en `relative`, au-dessus).
 */
export function GlassIndicator({ activeKey }: { activeKey: string | null }) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(-1)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const indicator = ref.current
    if (!indicator) return
    // Première apparition : posée sur place, sans glisser depuis le bord ; les changements suivants s'animent.
    if (previous.current < 0) delete indicator.dataset.ready
    const index = place(indicator, activeKey)
    if (!reducedMotion) stretch(indicator, previous.current, index)
    previous.current = index
    const frame = requestAnimationFrame(() => {
      indicator.dataset.ready = ''
    })
    const observer = new ResizeObserver(() => place(indicator, activeKey))
    if (indicator.parentElement) observer.observe(indicator.parentElement)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [activeKey, reducedMotion])

  return <span ref={ref} aria-hidden="true" className="glass-indicator" />
}
