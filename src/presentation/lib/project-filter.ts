import type { ProjectSummary, Stack } from '@/domain'

/** Les stacks proposées en filtre : seulement celles qu'au moins un projet utilise, dans l'ordre fourni. */
export function stacksUsedBy(
  projects: readonly ProjectSummary[],
  stacks: readonly Stack[],
): Stack[] {
  const used = new Set(projects.flatMap((project) => project.stackSlugs))
  return stacks.filter((stack) => used.has(stack.slug))
}

export function filterByStack(
  projects: readonly ProjectSummary[],
  stackSlug: string | null,
): ProjectSummary[] {
  if (stackSlug === null) return [...projects]
  return projects.filter((project) => project.stackSlugs.includes(stackSlug))
}

/** Tri stable : les projets mis en avant d'abord, l'ordre du CMS conservé à l'intérieur de chaque groupe. */
export function featuredFirst(projects: readonly ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}
