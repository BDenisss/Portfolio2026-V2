'use client'
import { useEffect } from 'react'
import { startGlassHover } from './glass-hover'

const MOTION_ALLOWED = '(prefers-reduced-motion: no-preference)'
// Survol réel (souris, stylet) : au doigt, seul l'écrasement à l'appui garde un sens.
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** Active le verre vivant (reflet, étirement des petits éléments) ; rien ne bouge sous reduced-motion. */
export function GlassHover() {
  useEffect(() => {
    if (!window.matchMedia(MOTION_ALLOWED).matches) return undefined
    return startGlassHover({ hover: window.matchMedia(FINE_POINTER).matches })
  }, [])
  return null
}
