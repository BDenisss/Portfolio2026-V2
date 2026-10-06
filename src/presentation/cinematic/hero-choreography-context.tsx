'use client'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * `idle` : aucune scène ne pilote le titre (il alterne seul) ; `armed` : la vidéo du hero joue, le titre attend
 * son cling ; `swapped` : le cling a eu lieu, le titre s'est transformé et ne bouge plus.
 */
export type ChoreographyPhase = 'idle' | 'armed' | 'swapped'

export type HeroChoreography = {
  phase: ChoreographyPhase
  arm: () => void
  disarm: () => void
  swap: () => void
}

const nothing = () => undefined
// Sans fournisseur (tests, pages sans hero animé), la chorégraphie est inerte.
const INERT: HeroChoreography = { phase: 'idle', arm: nothing, disarm: nothing, swap: nothing }

const HeroChoreographyContext = createContext<HeroChoreography>(INERT)

export function HeroChoreographyProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ChoreographyPhase>('idle')
  const arm = useCallback(() => setPhase((current) => (current === 'idle' ? 'armed' : current)), [])
  // Une fois transformé, le titre ne revient pas en arrière même si la vidéo quitte l'écran.
  const disarm = useCallback(
    () => setPhase((current) => (current === 'armed' ? 'idle' : current)),
    [],
  )
  const swap = useCallback(() => setPhase('swapped'), [])
  const value = useMemo(() => ({ phase, arm, disarm, swap }), [phase, arm, disarm, swap])
  return (
    <HeroChoreographyContext.Provider value={value}>{children}</HeroChoreographyContext.Provider>
  )
}

export const useHeroChoreography = (): HeroChoreography => useContext(HeroChoreographyContext)
