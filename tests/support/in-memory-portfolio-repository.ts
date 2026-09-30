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
import { aCinematicMedia, aSiteProfile } from './builders'

type Data = {
  site?: SiteProfile
  cinematic?: CinematicMedia
  services?: Service[]
  stacks?: Stack[]
  projects?: Project[]
  experiences?: Experience[]
}

export class InMemoryPortfolioRepository implements PortfolioRepository {
  constructor(private readonly data: Data = {}) {}

  async getSite(): Promise<SiteProfile> {
    return this.data.site ?? aSiteProfile()
  }
  async getCinematic(): Promise<CinematicMedia> {
    return this.data.cinematic ?? aCinematicMedia()
  }
  async getServices(): Promise<Service[]> {
    return this.data.services ?? []
  }
  async getStacks(): Promise<Stack[]> {
    return this.data.stacks ?? []
  }
  async getProjectSummaries(): Promise<ProjectSummary[]> {
    return this.data.projects ?? []
  }
  async getProjectBySlug(_locale: Locale, slug: string): Promise<Project | null> {
    return (this.data.projects ?? []).find((project) => project.slug === slug) ?? null
  }
  async getProjectRefs(): Promise<ProjectRef[]> {
    return (this.data.projects ?? []).map((project) => ({
      slug: project.slug,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }))
  }
  async getExperiences(): Promise<Experience[]> {
    return this.data.experiences ?? []
  }
}
