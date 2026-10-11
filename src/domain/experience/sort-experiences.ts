import type { Experience } from './experience'

/** Ordre du parcours : la plus récente d'abord (date de début), puis celle qui finit le plus tard ; en cours = la plus tardive. */
export function sortByMostRecent(experiences: readonly Experience[]): Experience[] {
  const endOf = (experience: Experience): string => experience.end ?? '9999-12-31'
  return [...experiences].sort(
    (a, b) => b.start.localeCompare(a.start) || endOf(b).localeCompare(endOf(a)),
  )
}
