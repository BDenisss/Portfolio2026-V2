import { describe, expect, it } from 'vitest'
import { hasReachedCue, TITLE_SWAP_CUE_SECONDS } from '@/presentation/cinematic/hero-choreography'

describe('hasReachedCue', () => {
  it('le « cling » de la scène tombe à 3,5 s (étincelle visible à la 8e image d’une planche à 2 images/s)', () => {
    expect(TITLE_SWAP_CUE_SECONDS).toBe(3.5)
  })

  it('reste faux avant le cling et devient vrai à l’instant du cling', () => {
    expect(hasReachedCue(0)).toBe(false)
    expect(hasReachedCue(3.49)).toBe(false)
    expect(hasReachedCue(3.5)).toBe(true)
    expect(hasReachedCue(5.9)).toBe(true)
  })

  it('accepte un autre instant (autre scène)', () => {
    expect(hasReachedCue(2, 1.5)).toBe(true)
    expect(hasReachedCue(1, 1.5)).toBe(false)
  })
})
