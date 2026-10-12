import { describe, expect, it } from 'vitest'
import {
  type Bump,
  BUMP_REST,
  isBumpSettled,
  pressBump,
  RIPPLE_STEP,
  rippleMap,
  stepBump,
  WAVE_SECONDS,
  waveAt,
} from '@/presentation/lib/glass-ripple'

/** Fait avancer le ressort pendant `seconds`, appui maintenu ou non ; renvoie aussi l'écart le plus bas atteint. */
function run(
  bump: Bump,
  pressed: boolean,
  seconds: number,
): { bump: Bump; lowest: number; highest: number } {
  let state = bump
  let lowest = state.offset
  let highest = state.offset
  for (let time = 0; time < seconds; time += RIPPLE_STEP) {
    state = stepBump(state, pressed)
    lowest = Math.min(lowest, state.offset)
    highest = Math.max(highest, state.offset)
  }
  return { bump: state, lowest, highest }
}

describe('clic liquide : rebond', () => {
  it('l’appui fait rentrer le verre, puis le maintient 4 % plus petit', () => {
    const { bump, lowest } = run(pressBump(BUMP_REST), true, 1)
    expect(lowest).toBeLessThan(-0.04)
    expect(bump.offset).toBeCloseTo(-0.04, 3)
  })

  it('au relâchement, il dépasse sa taille (rebond) puis s’y pose', () => {
    const held = run(pressBump(BUMP_REST), true, 1).bump
    const { bump, highest } = run(held, false, 1.5)
    expect(highest).toBeGreaterThan(0)
    expect(isBumpSettled(bump, false)).toBe(true)
  })

  it('n’est jamais « posé » tant que l’appui dure', () => {
    expect(isBumpSettled(BUMP_REST, true)).toBe(false)
    expect(isBumpSettled(BUMP_REST, false)).toBe(true)
  })
})

describe('clic liquide : onde', () => {
  it('part du point touché et s’élargit en ralentissant, jusqu’à 2,6 fois la largeur', () => {
    const start = waveAt(0, 100)
    const early = waveAt(0.1, 100)
    const late = waveAt(0.6, 100)
    expect(start.diameter).toBe(0)
    expect(early.diameter).toBeGreaterThan(0)
    expect(late.diameter - early.diameter).toBeLessThan(early.diameter * 3)
    expect(waveAt(10, 100).diameter).toBeCloseTo(260)
  })

  it('s’éteint : réfraction et lumière presque nulles quand on la retire', () => {
    expect(waveAt(0, 100).ringOpacity).toBe(1)
    const end = waveAt(WAVE_SECONDS, 100)
    expect(end.refraction).toBeLessThan(0.01)
    expect(end.ringOpacity).toBeLessThan(0.02)
  })
})

describe('clic liquide : carte de l’onde', () => {
  const SIZE = 64
  const pixels = rippleMap(SIZE)
  const at = (column: number, row: number): [number, number] => {
    const index = (row * SIZE + column) * 4
    return [pixels[index]!, pixels[index + 1]!]
  }

  it('ne décale rien au centre ni dans les coins', () => {
    expect(at(SIZE / 2, SIZE / 2)).toEqual([128, 128])
    expect(at(0, 0)).toEqual([128, 128])
  })

  it('sur la crête, pousse le fond vers l’extérieur (à droite : rouge > 128)', () => {
    const [red, green] = at(Math.round(SIZE * 0.9), SIZE / 2)
    expect(red).toBeGreaterThan(160)
    expect(Math.abs(green - 128)).toBeLessThan(8)
  })

  it('est entièrement opaque', () => {
    for (let index = 3; index < pixels.length; index += 4) expect(pixels[index]).toBe(255)
  })
})
