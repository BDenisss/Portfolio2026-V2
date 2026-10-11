import { describe, expect, it } from 'vitest'
import { slideOffset, wrapIndex } from '@/presentation/lib/carousel'

describe('carrousel : positions en boucle', () => {
  it("place l'active au centre et ses voisines de part et d'autre", () => {
    expect([0, 1, 2].map((index) => slideOffset(index, 0, 3))).toEqual([0, 1, -1])
    expect([0, 1, 2].map((index) => slideOffset(index, 1, 3))).toEqual([-1, 0, 1])
    expect([0, 1, 2].map((index) => slideOffset(index, 2, 3))).toEqual([1, -1, 0])
  })

  it('boucle aux deux extrémités', () => {
    expect(wrapIndex(3, 3)).toBe(0)
    expect(wrapIndex(-1, 3)).toBe(2)
  })
})
