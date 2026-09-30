import { describe, expect, it } from 'vitest'
import { formatMonth, formatRange } from '@/presentation/lib/format-date'

describe('format-date', () => {
  it('formate un mois court localisé', () => {
    expect(formatMonth('2024-10-01', 'fr')).toMatch(/oct\.? 2024/i)
    expect(formatMonth('2024-10-01', 'en')).toMatch(/oct(ober)? 2024/i)
  })
  it('formate une plage terminée', () => {
    expect(formatRange('2023-10-01', '2024-09-01', 'fr', 'Aujourd’hui')).toMatch(
      /oct\.? 2023.+sept\.? 2024/i,
    )
  })
  it('utilise le libellé fourni pour une plage en cours', () => {
    expect(formatRange('2024-10-01', null, 'fr', 'Aujourd’hui')).toMatch(/Aujourd’hui$/)
  })
})
