import type { Locale, SiteProfile } from '@/domain'

const DEFAULT_SITE_URL = 'http://localhost:3000'
const SCHEMA_ORG_CONTEXT = 'https://schema.org'
const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Nanterre',
  addressCountry: 'FR',
} as const

type PersonJsonLdProps = { readonly site: SiteProfile; readonly locale: Locale }

function pageUrl(locale: Locale): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  return new URL(`/${locale}`, siteUrl).href
}

function socialProfiles({ contact }: SiteProfile): string[] {
  return [contact.linkedin, contact.github].filter((url): url is string => Boolean(url))
}

/** Volontairement sans e-mail ni téléphone : ces données d'identité n'ont rien à faire dans le balisage public. */
function buildPersonJsonLd(site: SiteProfile, locale: Locale): Record<string, unknown> {
  return {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'Person',
    name: site.name,
    jobTitle: site.jobTitle,
    url: pageUrl(locale),
    sameAs: socialProfiles(site),
    address: POSTAL_ADDRESS,
  }
}

/** « < » est échappé : un texte saisi dans le CMS ne doit pas pouvoir refermer la balise script. */
function serializeForScriptTag(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function PersonJsonLd({ site, locale }: PersonJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeForScriptTag(buildPersonJsonLd(site, locale)) }}
    />
  )
}
