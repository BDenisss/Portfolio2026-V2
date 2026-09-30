import { describe, expect, it } from 'vitest'
import { hasSimpleIcon, resolveStackIcon } from '@/infrastructure/icons/simple-icons-resolver'

describe('resolveStackIcon', () => {
  it('résout un slug Simple Icons valide', () => {
    const icon = resolveStackIcon({ name: 'Docker', simpleIconSlug: 'docker' })
    expect(icon.kind).toBe('simple')
    if (icon.kind === 'simple') {
      expect(icon.slug).toBe('docker')
      expect(icon.path.length).toBeGreaterThan(20)
      expect(icon.hex).toMatch(/^[0-9A-Fa-f]{6}$/)
    }
  })
  it('un upload prime sur le slug', () => {
    const icon = resolveStackIcon({
      name: 'X',
      simpleIconSlug: 'docker',
      upload: { url: '/media/x.svg', alt: 'X' },
    })
    expect(icon).toEqual({ kind: 'upload', url: '/media/x.svg', alt: 'X' })
  })
  it('slug inconnu → monogramme', () => {
    expect(
      resolveStackIcon({ name: 'Clean Architecture', simpleIconSlug: 'does-not-exist-xyz' }),
    ).toEqual({ kind: 'monogram', letters: 'CA' })
  })
  it('sans slug → monogramme (1 mot = 2 premières lettres, 2+ mots = initiales)', () => {
    expect(resolveStackIcon({ name: 'xUnit' })).toEqual({ kind: 'monogram', letters: 'XU' })
    expect(resolveStackIcon({ name: 'Entity Framework Core' })).toEqual({
      kind: 'monogram',
      letters: 'EF',
    })
  })
  it('hasSimpleIcon', () => {
    expect(hasSimpleIcon('react')).toBe(true)
    expect(hasSimpleIcon('nope-nope')).toBe(false)
  })
})
