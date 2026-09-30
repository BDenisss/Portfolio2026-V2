import { describe, expect, it } from 'vitest'
import { validateAlt } from '@/infrastructure/cms/payload/collections/Media'

describe('validateAlt', () => {
  it('exige un alt pour une image', () => {
    expect(validateAlt('', 'image/webp')).toBe('Texte alternatif requis pour les images.')
    expect(validateAlt(undefined, 'image/png')).toBe('Texte alternatif requis pour les images.')
  })
  it('accepte un alt renseigné', () => {
    expect(validateAlt('Portrait', 'image/webp')).toBe(true)
  })
  it("n'exige rien pour PDF / vidéo / glb", () => {
    expect(validateAlt('', 'application/pdf')).toBe(true)
    expect(validateAlt('', 'video/mp4')).toBe(true)
    expect(validateAlt('', 'model/gltf-binary')).toBe(true)
    expect(validateAlt('', undefined)).toBe(true)
  })
})
