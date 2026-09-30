import { describe, expect, it } from 'vitest'
import { ListProjectRefs } from '@/application/portfolio/list-project-refs'
import { aProject } from '../../support/builders'
import { InMemoryPortfolioRepository } from '../../support/in-memory-portfolio-repository'

describe('ListProjectRefs', () => {
  it('renvoie les références des projets du dépôt', async () => {
    const repo = new InMemoryPortfolioRepository({ projects: [aProject({ slug: 'a' })] })
    const refs = await new ListProjectRefs(repo).execute()
    expect(refs.map((ref) => ref.slug)).toEqual(['a'])
  })
})
