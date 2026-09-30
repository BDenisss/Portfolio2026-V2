import { describe, expect, it } from 'vitest'
import { DOCK_ITEMS, NAV_ITEMS } from '@/presentation/components/ui/nav-items'

const SECTION_IDS = [
  'hero',
  'about',
  'services',
  'stack',
  'projects',
  'journey',
  'process',
  'contact',
]

describe('nav-items', () => {
  it('le dock mobile a 5 items maximum', () => {
    expect(DOCK_ITEMS.length).toBeLessThanOrEqual(5)
  })
  it('tous les ids existent dans le contrat des sections', () => {
    for (const item of [...NAV_ITEMS, ...DOCK_ITEMS]) expect(SECTION_IDS).toContain(item.id)
  })
  it('la nav desktop suit l’ordre de la page', () => {
    expect(NAV_ITEMS.map((item) => item.id)).toEqual([
      'about',
      'services',
      'stack',
      'projects',
      'journey',
      'contact',
    ])
  })
})
