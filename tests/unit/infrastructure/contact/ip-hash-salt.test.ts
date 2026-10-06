import { describe, expect, it } from 'vitest'
import { resolveIpHashSalt } from '@/infrastructure/contact/ip-hash-salt'

describe('resolveIpHashSalt', () => {
  it('accepte un sel aléatoire, en production comme ailleurs', () => {
    expect(resolveIpHashSalt('k3J9-sel-aleatoire', 'production')).toBe('k3J9-sel-aleatoire')
    expect(resolveIpHashSalt('k3J9-sel-aleatoire', 'development')).toBe('k3J9-sel-aleatoire')
  })

  it('refuse en production un sel absent, vide ou celui des exemples (hachage d’IP retrouvable)', () => {
    for (const weak of [undefined, '', 'change-me', 'replace-with-random-salt']) {
      expect(() => resolveIpHashSalt(weak, 'production')).toThrow(/IP_HASH_SALT/)
    }
  })

  it('tolère un sel vide en développement et en test', () => {
    expect(resolveIpHashSalt(undefined, 'development')).toBe('')
    expect(resolveIpHashSalt('', 'test')).toBe('')
  })
})
