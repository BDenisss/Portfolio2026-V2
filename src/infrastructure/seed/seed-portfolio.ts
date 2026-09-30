import type { Payload } from 'payload'
import { seedExperiences } from './seed-experiences'
import { seedCvMedia } from './seed-media'
import { seedProjects } from './seed-projects'
import { seedServices } from './seed-services'
import { seedSite } from './seed-site'
import { seedStacks } from './seed-stacks'

export type SeedReport = Readonly<
  Record<'stacks' | 'services' | 'experiences' | 'projects', number>
>

async function countDocuments(payload: Payload): Promise<SeedReport> {
  const count = async (collection: 'stacks' | 'services' | 'experiences' | 'projects') =>
    (await payload.count({ collection, overrideAccess: true })).totalDocs
  return {
    stacks: await count('stacks'),
    services: await count('services'),
    experiences: await count('experiences'),
    projects: await count('projects'),
  }
}

/** Idempotent : chaque agrégat est retrouvé par sa clé naturelle, deux exécutions donnent la même base. */
export async function seedPortfolio(payload: Payload): Promise<SeedReport> {
  const cv = await seedCvMedia(payload)
  const stackIds = await seedStacks(payload)
  await seedServices(payload)
  await seedExperiences(payload, stackIds)
  await seedProjects(payload, stackIds)
  await seedSite(payload, cv)
  return countDocuments(payload)
}
