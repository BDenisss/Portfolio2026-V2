import { describe, expect, it } from 'vitest'
import { routing } from '@/presentation/i18n/routing'
import { NAMESPACES } from '@/presentation/i18n/namespaces'

describe('routing', () => {
  it('fr par défaut, en disponible, préfixe toujours', () => {
    expect(routing.locales).toEqual(['fr', 'en'])
    expect(routing.defaultLocale).toBe('fr')
    expect(routing.localePrefix).toBe('always')
  })
  it('12 namespaces du contrat', () => {
    expect([...NAMESPACES]).toEqual([
      'common',
      'nav',
      'hero',
      'about',
      'services',
      'stack',
      'projects',
      'journey',
      'process',
      'contact',
      'footer',
      'errors',
    ])
  })
})
