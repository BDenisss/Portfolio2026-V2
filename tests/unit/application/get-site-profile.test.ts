import { describe, expect, it } from 'vitest'
import { GetSiteProfile } from '@/application/portfolio/get-site-profile'
import { aSiteProfile } from '../../support/builders'
import { InMemoryPortfolioRepository } from '../../support/in-memory-portfolio-repository'

describe('GetSiteProfile', () => {
  it('renvoie le profil fourni par le dépôt', async () => {
    const site = aSiteProfile({ name: 'Autre Nom' })
    const useCase = new GetSiteProfile(new InMemoryPortfolioRepository({ site }))
    expect(await useCase.execute('en')).toBe(site)
  })
})
