import type { Experience } from '../experience/experience'

export type CareerStats = {
  readonly years: number
  readonly experiences: number
  readonly technologies: number
  readonly projects: number
}

const MONTHS_PER_YEAR = 12

// Tout en UTC : les dates du CMS sont des instants UTC, le fuseau du serveur ne doit pas décaler l'ancienneté.
const monthsBetween = (from: Date, to: Date): number =>
  Math.max(
    0,
    (to.getUTCFullYear() - from.getUTCFullYear()) * MONTHS_PER_YEAR +
      (to.getUTCMonth() - from.getUTCMonth()),
  )

type CareerStatsInput = {
  experiences: readonly Pick<Experience, 'kind' | 'start'>[]
  projectsCount: number
  stacksCount: number
  now: Date
}

export function computeCareerStats(input: CareerStatsInput): CareerStats {
  const work = input.experiences.filter((experience) => experience.kind === 'work')
  const starts = work.map((experience) => new Date(experience.start).getTime())
  const years =
    starts.length === 0
      ? 0
      : Math.floor(monthsBetween(new Date(Math.min(...starts)), input.now) / MONTHS_PER_YEAR)
  return {
    years,
    experiences: work.length,
    technologies: input.stacksCount,
    projects: input.projectsCount,
  }
}
