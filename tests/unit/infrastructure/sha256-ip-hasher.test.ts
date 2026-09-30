import { describe, expect, it } from 'vitest'
import { Sha256IpHasher } from '@/infrastructure/contact/sha256-ip-hasher'

describe('Sha256IpHasher', () => {
  it('est déterministe', () => {
    const hasher = new Sha256IpHasher('sel')
    expect(hasher.hash('203.0.113.7')).toBe(hasher.hash('203.0.113.7'))
  })
  it('produit 32 caractères hexadécimaux', () => {
    expect(new Sha256IpHasher('sel').hash('203.0.113.7')).toMatch(/^[0-9a-f]{32}$/)
  })
  it('change avec le sel', () => {
    expect(new Sha256IpHasher('a').hash('203.0.113.7')).not.toBe(
      new Sha256IpHasher('b').hash('203.0.113.7'),
    )
  })
  it('change avec l’adresse IP', () => {
    const hasher = new Sha256IpHasher('sel')
    expect(hasher.hash('203.0.113.7')).not.toBe(hasher.hash('203.0.113.8'))
  })
  it('ne contient pas l’adresse en clair', () => {
    expect(new Sha256IpHasher('sel').hash('203.0.113.7')).not.toContain('203')
  })
})
