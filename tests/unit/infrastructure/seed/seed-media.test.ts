import { describe, expect, it } from 'vitest'
import { cvDirectory } from '@/infrastructure/seed/seed-media'

describe('cvDirectory', () => {
  it('lit les CV dans img/ par défaut (dossier ignoré par git)', () => {
    expect(cvDirectory({})).toBe('img')
  })

  it('accepte un autre dossier, pour la CI qui n’a pas les vrais CV', () => {
    expect(cvDirectory({ SEED_CV_DIR: '/tmp/cv-factices' })).toBe('/tmp/cv-factices')
  })

  it('retombe sur img/ quand la variable est vide', () => {
    expect(cvDirectory({ SEED_CV_DIR: '' })).toBe('img')
  })
})
