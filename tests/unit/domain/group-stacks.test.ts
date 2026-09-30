import { describe, expect, it } from 'vitest'
import { groupStacksByCategory } from '@/domain'
import { aStack } from '../../support/builders'

describe('groupStacksByCategory', () => {
  it("respecte l'ordre des catégories, omet les vides et garde l'ordre d'entrée", () => {
    const groups = groupStacksByCategory([
      aStack({ slug: 'a', category: 'devops' }),
      aStack({ slug: 'b', category: 'language' }),
      aStack({ slug: 'c', category: 'language' }),
    ])
    expect(groups.map((group) => group.category)).toEqual(['language', 'devops'])
    expect(groups[0]!.stacks.map((stack) => stack.slug)).toEqual(['b', 'c'])
  })

  it('renvoie une liste vide sans stack', () => {
    expect(groupStacksByCategory([])).toEqual([])
  })
})
