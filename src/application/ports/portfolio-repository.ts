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

export interface PortfolioRepository {
  getSite(locale: Locale): Promise<SiteProfile>
  getCinematic(): Promise<CinematicMedia>
  getServices(locale: Locale): Promise<Service[]>
  getStacks(locale: Locale): Promise<Stack[]>
  getProjectSummaries(locale: Locale): Promise<ProjectSummary[]>
  getProjectBySlug(locale: Locale, slug: string): Promise<Project | null>
  getProjectRefs(): Promise<ProjectRef[]>
  getExperiences(locale: Locale): Promise<Experience[]>
}
