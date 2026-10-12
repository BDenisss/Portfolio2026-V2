import { describe, expect, it } from 'vitest'
import { holoFrom } from '@/presentation/lib/holo'

describe('effet holographique', () => {
  it('au centre, la carte est à plat et le reflet centré', () => {
    const state = holoFrom(0.5, 0.5)
    expect(state.rotateX).toBeCloseTo(0)
    expect(state.rotateY).toBeCloseTo(0)
    expect(state.shineX).toBeCloseTo(50)
    expect(state.shineY).toBeCloseTo(50)
    expect(state.sparkOpacity).toBeCloseTo(0.2)
  })

  it('dans un coin, la carte s’incline, le reflet se déplace et les paillettes brillent au maximum', () => {
    const corner = holoFrom(0, 0)
    expect(corner.rotateX).toBeCloseTo(-16.67, 1)
    expect(corner.rotateY).toBeCloseTo(11.11, 1)
    expect(corner.shineX).toBeCloseTo(83.33, 1)
    expect(corner.sparkOpacity).toBe(1)
  })

  it('ignore un pointeur sorti de la carte (bornes 0 → 1)', () => {
    expect(holoFrom(-2, 3)).toEqual(holoFrom(0, 1))
  })
})
