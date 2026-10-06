'use client'
import { useEffect } from 'react'
import { useHeroChoreography } from './hero-choreography-context'
import type { HeroMode } from './hero-mode'

/**
 * Relie la scène vidéo du hero au titre : tant que la vidéo joue, le titre attend son « cling » ; le callback
 * renvoyé est à donner à la vidéo. Dans les autres modes (poster, orbe, 3D), le titre alterne comme avant.
 */
export function useVideoChoreography(mode: HeroMode): (() => void) | undefined {
  const { arm, disarm, swap } = useHeroChoreography()
  const directing = mode === 'video'
  useEffect(() => {
    if (!directing) return
    arm()
    return disarm
  }, [directing, arm, disarm])
  return directing ? swap : undefined
}
