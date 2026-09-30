import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SystemClock } from '@/infrastructure/system/system-clock'
import { seedPortfolio } from '@/infrastructure/seed/seed-portfolio'
import { GetHomePage } from '@/application/portfolio/get-home-page'
import { PayloadPortfolioRepository } from '@/infrastructure/cms/payload/payload-portfolio-repository'

const ctx = { disableRevalidate: true }
const draftSlug = `draft-only-${Date.now()}`
let payload: Payload
let repo: PayloadPortfolioRepository

beforeAll(async () => {
  payload = await getPayload({ config })
  await seedPortfolio(payload)
  repo = new PayloadPortfolioRepository(() => Promise.resolve(payload))
})
afterAll(async () => {
  await payload.delete({
    collection: 'projects',
    where: { slug: { equals: draftSlug } },
    overrideAccess: true,
    context: ctx,
  })
})

describe.skipIf(!process.env.DATABASE_URI)('PayloadPortfolioRepository', () => {
  it('ne liste aucun brouillon et ne renvoie pas un brouillon par slug', async () => {
    await payload.create({
      collection: 'projects',
      data: { title: 'Brouillon', slug: draftSlug, _status: 'draft' },
      draft: true,
      overrideAccess: true,
      context: ctx,
    })

    const summaries = await repo.getProjectSummaries('fr')
    const refs = await repo.getProjectRefs()

    expect(summaries.map((project) => project.slug)).not.toContain(draftSlug)
    expect(refs.map((ref) => ref.slug)).not.toContain(draftSlug)
    expect(await repo.getProjectBySlug('fr', draftSlug)).toBeNull()
  })

  it('renvoie null pour un slug inexistant', async () => {
    expect(await repo.getProjectBySlug('fr', 'slug-inexistant')).toBeNull()
  })

  it("n'expose jamais contactTo dans le profil du site", async () => {
    const site = await repo.getSite('fr')
    expect(site.contact).not.toHaveProperty('contactTo')
  })

  it('assemble la page d’accueil à partir du contenu seedé', async () => {
    const home = await new GetHomePage(repo, new SystemClock()).execute('fr')

    expect(home.services.length).toBeGreaterThanOrEqual(4)
    expect(home.stacks.length).toBeGreaterThanOrEqual(20)
    expect(home.stats.years).toBeGreaterThanOrEqual(3)
    expect(home.projects.map((project) => project.slug)).toContain('ce-portfolio')
  })

  it('rend le profil du site dans la langue demandée', async () => {
    const french = await repo.getSite('fr')
    const english = await repo.getSite('en')

    expect(french.jobTitle).toBe('Développeur Full Stack')
    expect(english.jobTitle).toBe('Full Stack Developer')
    expect(french.hero.rotatingTitles).toHaveLength(2)
  })
})
