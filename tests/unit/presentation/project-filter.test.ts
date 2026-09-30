import { describe, expect, it } from 'vitest'
import { featuredFirst, filterByStack, stacksUsedBy } from '@/presentation/lib/project-filter'
import { aProjectSummary, aStack } from '../../support/builders'

const react = aStack({ id: '1', slug: 'react', name: 'React' })
const php = aStack({ id: '2', slug: 'php', name: 'PHP' })
const unused = aStack({ id: '3', slug: 'rust', name: 'Rust' })

const withReact = aProjectSummary({ id: 'a', slug: 'a', stacks: [react], stackSlugs: ['react'] })
const withPhp = aProjectSummary({ id: 'b', slug: 'b', stacks: [php], stackSlugs: ['php'] })

describe('stacksUsedBy', () => {
  it('ne garde que les stacks utilisées par au moins un projet, dans l’ordre fourni', () => {
    expect(stacksUsedBy([withPhp, withReact], [react, php, unused])).toEqual([react, php])
  })
  it('renvoie une liste vide sans projet', () => {
    expect(stacksUsedBy([], [react])).toEqual([])
  })
})

describe('filterByStack', () => {
  it('renvoie tout sans filtre actif', () => {
    expect(filterByStack([withReact, withPhp], null)).toEqual([withReact, withPhp])
  })
  it('ne garde que les projets qui utilisent la stack', () => {
    expect(filterByStack([withReact, withPhp], 'php')).toEqual([withPhp])
  })
  it('renvoie une liste vide si aucun projet ne correspond', () => {
    expect(filterByStack([withReact], 'php')).toEqual([])
  })
})

describe('featuredFirst', () => {
  it('place les projets mis en avant d’abord, en gardant l’ordre relatif (tri stable)', () => {
    const plain1 = aProjectSummary({ id: '1', slug: 'p1', featured: false })
    const star1 = aProjectSummary({ id: '2', slug: 's1', featured: true })
    const plain2 = aProjectSummary({ id: '3', slug: 'p2', featured: false })
    const star2 = aProjectSummary({ id: '4', slug: 's2', featured: true })
    expect(featuredFirst([plain1, star1, plain2, star2]).map((project) => project.slug)).toEqual([
      's1',
      's2',
      'p1',
      'p2',
    ])
  })
  it('ne modifie pas le tableau d’origine', () => {
    const input = [
      aProjectSummary({ featured: false }),
      aProjectSummary({ slug: 'x', featured: true }),
    ]
    const snapshot = [...input]
    featuredFirst(input)
    expect(input).toEqual(snapshot)
  })
})
