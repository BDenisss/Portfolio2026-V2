import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, isLocale, LOCALES } from '@/domain'

describe('locale', () => {
  it('le français est la locale par défaut et fait partie des locales supportées', () => {
    expect(DEFAULT_LOCALE).toBe('fr')
    expect(LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('isLocale accepte fr et en, rejette le reste', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})
