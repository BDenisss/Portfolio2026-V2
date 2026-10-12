import { describe, expect, it } from 'vitest'
import { RESTING, stretchFrom } from '@/presentation/lib/glass-stretch'

describe('étirement du verre', () => {
  it('au centre, le verre ne bouge pas', () => {
    const state = stretchFrom(0.5, 0.5)
    expect(state.x).toBeCloseTo(RESTING.x)
    expect(state.y).toBeCloseTo(RESTING.y)
    expect(state.scaleX).toBeCloseTo(1)
    expect(state.scaleY).toBeCloseTo(1)
  })

  it('au bord droit, il glisse vers le pointeur, s’allonge en largeur et se resserre en hauteur', () => {
    const state = stretchFrom(1, 0.5)
    expect(state.x).toBeCloseTo(6)
    expect(state.y).toBeCloseTo(0)
    expect(state.scaleX).toBeCloseTo(1.045)
    expect(state.scaleY).toBeCloseTo(0.985)
  })

  it('en haut à gauche, il part vers le coin, de façon symétrique', () => {
    const state = stretchFrom(0, 0)
    expect(state.x).toBeCloseTo(-6)
    expect(state.y).toBeCloseTo(-6)
    expect(state.scaleX).toBeCloseTo(1.03)
    expect(state.scaleY).toBeCloseTo(1.03)
  })

  it('reste borné quand le pointeur sort de l’élément', () => {
    expect(stretchFrom(3, -2)).toEqual(stretchFrom(1, 0))
  })
})
