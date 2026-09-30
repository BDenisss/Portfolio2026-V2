import { describe, expect, it } from 'vitest'
import { coverGradient } from '@/presentation/lib/project-cover'

const SEEDED_SLUGS = [
  'plateforme-interne-bouygues',
  'dywikis',
  'supervision-axima',
  'quiz-ville-de-clamart',
]

describe('coverGradient', () => {
  it('est déterministe', () => {
    expect(coverGradient('dywikis')).toEqual(coverGradient('dywikis'))
  })
  it('utilise uniquement des tokens', () => {
    const gradient = coverGradient('dywikis')
    expect(gradient.from).toMatch(/^var\(--tint-/)
    expect(gradient.to).toMatch(/^var\(--tint-/)
    expect(gradient.from).not.toBe(gradient.to)
  })
  it('varie selon le slug', () => {
    const variants = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((slug) => JSON.stringify(coverGradient(slug))),
    )
    expect(variants.size).toBeGreaterThan(1)
  })
  it('ne produit jamais deux teintes identiques, pour aucun slug', () => {
    const slugs = [...SEEDED_SLUGS, ...Array.from({ length: 200 }, (_, index) => `slug-${index}`)]
    for (const slug of slugs) {
      const { from, to } = coverGradient(slug)
      expect(from, slug).not.toBe(to)
    }
  })
})
