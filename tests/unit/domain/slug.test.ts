import { describe, expect, it } from 'vitest'
import { slugify } from '@/domain'

describe('slugify', () => {
  it('retire accents et ponctuation', () => {
    expect(slugify("Dywiki's — Base de données de films")).toBe('dywikis-base-de-donnees-de-films')
  })
  it('compacte les séparateurs et trim', () => {
    expect(slugify('  Hello   --  World  ')).toBe('hello-world')
  })
  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(slugify('')).toBe('')
  })
})
