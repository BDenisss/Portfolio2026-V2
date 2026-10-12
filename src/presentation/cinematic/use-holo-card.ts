'use client'
import { type RefObject, useEffect } from 'react'
import { holoFrom, type HoloState } from '@/presentation/lib/holo'
import { usePrefersReducedMotion } from '@/presentation/lib/use-prefers-reduced-motion'

// Uniquement avec une souris ou un stylet : au doigt, l'effet bloquerait le défilement de la page.
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

function applyHolo(card: HTMLElement, state: HoloState): void {
  card.style.setProperty('--holo-rx', `${state.rotateX}deg`)
  card.style.setProperty('--holo-ry', `${state.rotateY}deg`)
  card.style.setProperty('--holo-shine-x', `${state.shineX}%`)
  card.style.setProperty('--holo-shine-y', `${state.shineY}%`)
  card.style.setProperty('--holo-spark-x', `${state.sparkX}%`)
  card.style.setProperty('--holo-spark-y', `${state.sparkY}%`)
  card.style.setProperty('--holo-spark-opacity', String(state.sparkOpacity))
  card.dataset.holoActive = ''
}

/** Retour au repos : les variables retombent sur leurs valeurs CSS, la transition ramène la carte à plat. */
function resetHolo(card: HTMLElement): void {
  for (const name of [
    '--holo-rx',
    '--holo-ry',
    '--holo-shine-x',
    '--holo-shine-y',
    '--holo-spark-x',
    '--holo-spark-y',
    '--holo-spark-opacity',
  ])
    card.style.removeProperty(name)
  delete card.dataset.holoActive
}

/**
 * Effet « carte holographique » au survol : la carte s'incline vers le pointeur, un reflet irisé et des
 * paillettes suivent la lumière. La position est lue sur la scène (non inclinée) pour rester stable.
 */
export function useHoloCard(
  scene: RefObject<HTMLElement | null>,
  card: RefObject<HTMLElement | null>,
): void {
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    const sceneElement = scene.current
    const cardElement = card.current
    if (!sceneElement || !cardElement || reducedMotion) return
    if (!window.matchMedia(FINE_POINTER).matches) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const box = sceneElement.getBoundingClientRect()
      const state = holoFrom(
        (event.clientX - box.left) / box.width,
        (event.clientY - box.top) / box.height,
      )
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => applyHolo(cardElement, state))
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      resetHolo(cardElement)
    }
    sceneElement.addEventListener('pointermove', onMove)
    sceneElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      sceneElement.removeEventListener('pointermove', onMove)
      sceneElement.removeEventListener('pointerleave', onLeave)
      resetHolo(cardElement)
    }
  }, [scene, card, reducedMotion])
}
