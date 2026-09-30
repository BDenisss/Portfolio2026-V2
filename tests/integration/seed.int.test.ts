import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { seedPortfolio } from '@/infrastructure/seed/seed-portfolio'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

const titleOf = async (locale: 'fr' | 'en') => {
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'plateforme-interne-bouygues' } },
    locale,
    limit: 1,
    overrideAccess: false,
    draft: false,
  })
  return docs[0]?.title
}

describe.skipIf(!process.env.DATABASE_URI)('seed', () => {
  it('est idempotent : deux exécutions donnent la même base', async () => {
    const first = await seedPortfolio(payload)
    const second = await seedPortfolio(payload)

    expect(second).toEqual(first)
    expect(second).toMatchObject({ projects: 4, services: 4, experiences: 5 })
    expect(second.stacks).toBeGreaterThanOrEqual(28)
  })

  it('publie les projets et les localise en français et en anglais', async () => {
    const french = await titleOf('fr')
    const english = await titleOf('en')

    expect(french).toBe('Application interne web & mobile')
    expect(english).toBe('Internal web & mobile application')
  })

  it('ne duplique pas les lignes de tableau entre les langues', async () => {
    const site = await payload.findGlobal({ slug: 'site', locale: 'fr', depth: 0 })

    expect(site.hero?.rotatingTitles).toHaveLength(2)
    expect(site.process?.steps).toHaveLength(5)
  })

  it('garde le téléphone masqué', async () => {
    const site = await payload.findGlobal({ slug: 'site', locale: 'fr', depth: 0 })

    expect(site.contact?.showPhone).toBe(false)
  })
})
