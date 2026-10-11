'use client'
import { type DragEvent, type MouseEvent, type PointerEvent, useRef } from 'react'

const SWIPE_THRESHOLD = 48

/** Balayage horizontal (doigt ou souris) ; le clic qui termine un balayage n'ouvre pas le projet. */
export function useSwipe(onPrevious: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null)
  const swiped = useRef(false)
  return {
    onPointerDown: (event: PointerEvent) => {
      startX.current = event.clientX
      swiped.current = false
    },
    onPointerUp: (event: PointerEvent) => {
      if (startX.current === null) return
      const distance = event.clientX - startX.current
      startX.current = null
      if (Math.abs(distance) < SWIPE_THRESHOLD) return
      swiped.current = true
      if (distance < 0) onNext()
      else onPrevious()
    },
    onPointerCancel: () => {
      startX.current = null
    },
    // Sans ça, tirer sur un lien ou une image lance le glisser natif et annule le balayage.
    onDragStart: (event: DragEvent) => event.preventDefault(),
    onClickCapture: (event: MouseEvent) => {
      if (!swiped.current) return
      swiped.current = false
      event.preventDefault()
      event.stopPropagation()
    },
  }
}
