import { describe, expect, it } from 'vitest'
import { GetProjectPage } from '@/application/portfolio/get-project-page'
import { aProject } from '../../support/builders'
import { InMemoryPortfolioRepository } from '../../support/in-memory-portfolio-repository'

const projectsNamed = (...slugs: string[]) =>
  slugs.map((slug, index) => aProject({ id: String(index), slug }))

const pageFor = (slug: string, ...slugs: string[]) =>
  new GetProjectPage(
    new InMemoryPortfolioRepository({ projects: projectsNamed(...slugs) }),
  ).execute({
    locale: 'fr',
    slug,
  })

describe('GetProjectPage', () => {
  it('renvoie null pour un slug inconnu', async () => {
    expect(await pageFor('inconnu', 'a', 'b')).toBeNull()
  })

  it('donne le projet précédent et le suivant pour un projet au milieu', async () => {
    const page = await pageFor('b', 'a', 'b', 'c')
    expect(page?.previous?.slug).toBe('a')
    expect(page?.next?.slug).toBe('c')
  })

  it("n'a pas de précédent pour le premier projet", async () => {
    const page = await pageFor('a', 'a', 'b')
    expect(page?.previous).toBeNull()
    expect(page?.next?.slug).toBe('b')
  })

  it("n'a pas de suivant pour le dernier projet", async () => {
    const page = await pageFor('b', 'a', 'b')
    expect(page?.previous?.slug).toBe('a')
    expect(page?.next).toBeNull()
  })

  it('un projet seul n’a ni précédent ni suivant', async () => {
    const page = await pageFor('a', 'a')
    expect(page?.previous).toBeNull()
    expect(page?.next).toBeNull()
  })
})
