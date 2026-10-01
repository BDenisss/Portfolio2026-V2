import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { getPortfolioUseCases } from '@/composition'
import { routing } from '@/presentation/i18n/routing'

const DEFAULT_SITE_URL = 'http://localhost:3000'

/** Filet de sécurité : la liste des projets publiés est relue une fois par heure. */
export const revalidate = 3600

/** Une entrée par langue pour une même page, chacune déclarant les versions sœurs (hreflang). */
function entriesForPage(
  siteUrl: string,
  path: string,
  lastModified?: string,
): MetadataRoute.Sitemap {
  const localizedUrls = routing.locales.map((locale) => ({
    locale,
    url: new URL(`/${locale}${path}`, siteUrl).href,
  }))
  const languages = Object.fromEntries(localizedUrls.map(({ locale, url }) => [locale, url]))
  return localizedUrls.map(({ url }) => ({
    url,
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Build sans base de données (image Docker) : le plan du site se génère à la première requête.
  if (process.env.SKIP_BUILD_STATIC === '1') await connection()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  const projects = await getPortfolioUseCases().listProjectRefs.execute()
  return [
    ...entriesForPage(siteUrl, ''),
    ...projects.flatMap(({ slug, updatedAt }) =>
      entriesForPage(siteUrl, `/projects/${slug}`, updatedAt),
    ),
  ]
}
