import { describe, expect, it } from 'vitest'
import { GetHomePage } from '@/application/portfolio/get-home-page'
import { aProject, aService, aStack, anExperience } from '../../support/builders'
import { fixedClock } from '../../support/fixed-clock'
import { InMemoryPortfolioRepository } from '../../support/in-memory-portfolio-repository'

describe('GetHomePage', () => {
  it('assemble toutes les sections et calcule les statistiques de carrière', async () => {
    const repo = new InMemoryPortfolioRepository({
      services: [aService(), aService({ id: '2' })],
      stacks: [aStack({ id: '1' }), aStack({ id: '2', slug: 'b' }), aStack({ id: '3', slug: 'c' })],
      projects: [aProject({ id: '1', slug: 'a' }), aProject({ id: '2', slug: 'b' })],
      experiences: [anExperience({ kind: 'work', start: '2023-02-01' })],
    })

    const home = await new GetHomePage(repo, fixedClock('2026-09-30T00:00:00Z')).execute('fr')

    expect(home.services).toHaveLength(2)
    expect(home.stats).toEqual({ years: 3, experiences: 1, technologies: 3, projects: 2 })
  })
})
