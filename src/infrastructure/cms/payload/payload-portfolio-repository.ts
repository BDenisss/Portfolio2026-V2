import type { Payload } from 'payload'
import type { PortfolioRepository } from '@/application/ports/portfolio-repository'
import type {
  CinematicMedia,
  Experience,
  Locale,
  Project,
  ProjectRef,
  ProjectSummary,
  Service,
  SiteProfile,
  Stack,
} from '@/domain'
import { keepPresent } from './mappers/values'
import {
  mapCinematic,
  mapExperience,
  mapProject,
  mapProjectSummary,
  mapService,
  mapSite,
  mapStack,
} from './mappers'

/** L'API locale ignore l'access control par défaut : on force la lecture « visiteur » (publiés uniquement). */
const PUBLIC_READ = { overrideAccess: false, draft: false } as const
const LIST = { depth: 2, limit: 200, pagination: false, sort: 'order' } as const
const GLOBAL_DEPTH = 1

export class PayloadPortfolioRepository implements PortfolioRepository {
  constructor(private readonly client: () => Promise<Payload>) {}

  async getSite(locale: Locale): Promise<SiteProfile> {
    const payload = await this.client()
    const site = await payload.findGlobal({
      slug: 'site',
      locale,
      depth: GLOBAL_DEPTH,
      ...PUBLIC_READ,
    })
    return mapSite(site)
  }

  async getCinematic(): Promise<CinematicMedia> {
    const payload = await this.client()
    const cinematic = await payload.findGlobal({
      slug: 'cinematic',
      depth: GLOBAL_DEPTH,
      ...PUBLIC_READ,
    })
    return mapCinematic(cinematic)
  }

  async getServices(locale: Locale): Promise<Service[]> {
    const payload = await this.client()
    const { docs } = await payload.find({ collection: 'services', locale, ...LIST, ...PUBLIC_READ })
    return docs.map(mapService)
  }

  async getStacks(locale: Locale): Promise<Stack[]> {
    const payload = await this.client()
    const { docs } = await payload.find({ collection: 'stacks', locale, ...LIST, ...PUBLIC_READ })
    return keepPresent(docs.map(mapStack))
  }

  async getProjectSummaries(locale: Locale): Promise<ProjectSummary[]> {
    const payload = await this.client()
    const { docs } = await payload.find({ collection: 'projects', locale, ...LIST, ...PUBLIC_READ })
    return docs.map(mapProjectSummary)
  }

  async getProjectBySlug(locale: Locale, slug: string): Promise<Project | null> {
    const payload = await this.client()
    const { docs } = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      locale,
      depth: LIST.depth,
      limit: 1,
      ...PUBLIC_READ,
    })
    const [doc] = docs
    return doc ? mapProject(doc) : null
  }

  async getProjectRefs(): Promise<ProjectRef[]> {
    const payload = await this.client()
    const { docs } = await payload.find({
      collection: 'projects',
      depth: 0,
      limit: LIST.limit,
      pagination: false,
      select: { slug: true, updatedAt: true },
      ...PUBLIC_READ,
    })
    return docs.flatMap((doc) => (doc.slug ? [{ slug: doc.slug, updatedAt: doc.updatedAt }] : []))
  }

  async getExperiences(locale: Locale): Promise<Experience[]> {
    const payload = await this.client()
    const { docs } = await payload.find({
      collection: 'experiences',
      locale,
      ...LIST,
      ...PUBLIC_READ,
    })
    return docs.map(mapExperience)
  }
}
