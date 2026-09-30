import type {
  CareerStats,
  CinematicMedia,
  Experience,
  ProjectSummary,
  Service,
  SiteProfile,
  Stack,
} from '@/domain'

export type HomePage = {
  readonly site: SiteProfile
  readonly cinematic: CinematicMedia
  readonly services: readonly Service[]
  readonly stacks: readonly Stack[]
  readonly projects: readonly ProjectSummary[]
  readonly experiences: readonly Experience[]
  readonly stats: CareerStats
}
