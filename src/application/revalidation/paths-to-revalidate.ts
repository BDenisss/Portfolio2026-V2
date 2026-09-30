import { LOCALES } from '@/domain'

export type RevalidationKind = 'home' | 'project'

export function pathsToRevalidate(kind: RevalidationKind, slug?: string | null): string[] {
  const home = LOCALES.map((locale) => `/${locale}`)
  if (kind !== 'project' || !slug) return home
  return [...home, ...LOCALES.map((locale) => `/${locale}/projects/${slug}`)]
}
