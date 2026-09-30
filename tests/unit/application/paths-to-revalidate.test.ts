import { describe, expect, it } from 'vitest'
import { pathsToRevalidate } from '@/application/revalidation/paths-to-revalidate'

describe('pathsToRevalidate', () => {
  it('home → la page d’accueil de chaque langue', () => {
    expect(pathsToRevalidate('home')).toEqual(['/fr', '/en'])
  })

  it('project → accueil + page détail de chaque langue', () => {
    expect(pathsToRevalidate('project', 'ma-app')).toEqual([
      '/fr',
      '/en',
      '/fr/projects/ma-app',
      '/en/projects/ma-app',
    ])
  })

  it('project sans slug → accueil seulement', () => {
    expect(pathsToRevalidate('project')).toEqual(['/fr', '/en'])
    expect(pathsToRevalidate('project', null)).toEqual(['/fr', '/en'])
  })
})
