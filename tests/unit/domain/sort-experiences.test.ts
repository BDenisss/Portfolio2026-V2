import { describe, expect, it } from 'vitest'
import { sortByMostRecent } from '@/domain'
import { anExperience } from '../../support/builders'

describe('sortByMostRecent', () => {
  it('range le parcours du plus récent au plus ancien, quel que soit l’ordre du CMS', () => {
    const sorted = sortByMostRecent([
      anExperience({ id: 'dywikis', start: '2022-10-01', end: '2023-01-01' }),
      anExperience({ id: 'bouygues', start: '2024-10-01', end: '2026-10-01' }),
      anExperience({ id: 'axima', start: '2023-10-01', end: '2024-09-01' }),
      anExperience({ id: 'iim', start: '2024-09-01', end: '2026-09-01' }),
    ])
    expect(sorted.map((experience) => experience.id)).toEqual([
      'bouygues',
      'iim',
      'axima',
      'dywikis',
    ])
  })

  it('à début égal, celle qui est en cours passe devant', () => {
    const sorted = sortByMostRecent([
      anExperience({ id: 'finie', start: '2024-01-01', end: '2024-06-01' }),
      anExperience({ id: 'en-cours', start: '2024-01-01', end: null }),
    ])
    expect(sorted[0]?.id).toBe('en-cours')
  })
})
