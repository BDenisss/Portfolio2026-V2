import type { Payload } from 'payload'
import type { Locale } from '@/domain'
import { site } from './data/site'
import type { CvMediaIds } from './seed-media'
import { seedApi, SEED_CONTEXT, withRowIds, type Fields, type SavedDoc } from './upsert'

const savedRows = (saved: SavedDoc | null, group: string, field: string): unknown => {
  const section = saved?.[group] as Record<string, unknown> | undefined
  return section?.[field]
}

function heroFields(locale: Locale, saved: SavedDoc | null): Fields {
  const { hero } = site
  return {
    eyebrow: hero.eyebrow[locale],
    ctaPrimary: hero.ctaPrimary[locale],
    ctaSecondary: hero.ctaSecondary[locale],
    trustedByTitle: hero.trustedByTitle[locale],
    rotatingTitles: withRowIds(
      hero.rotatingTitles.map((title) => ({ text: title[locale] })),
      savedRows(saved, 'hero', 'rotatingTitles'),
    ),
    chips: withRowIds(
      hero.chips.map((chip) => ({ value: chip.value[locale], label: chip.label[locale] })),
      savedRows(saved, 'hero', 'chips'),
    ),
    trustedBy: withRowIds(
      hero.trustedBy.map((name) => ({ name })),
      savedRows(saved, 'hero', 'trustedBy'),
    ),
  }
}

function processFields(locale: Locale, saved: SavedDoc | null): Fields {
  return {
    headline: site.process.headline[locale],
    steps: withRowIds(
      site.process.steps.map((step) => ({ title: step.title[locale], text: step.text[locale] })),
      savedRows(saved, 'process', 'steps'),
    ),
  }
}

function contactFields(): Fields {
  // Le téléphone ne vit jamais dans le dépôt : il n'arrive que par l'environnement local.
  return { ...site.contact, phone: process.env.SEED_PHONE || undefined }
}

function buildSite(locale: Locale, saved: SavedDoc | null, cv: CvMediaIds): Fields {
  return {
    identity: {
      name: site.identity.name,
      location: site.identity.location,
      jobTitle: site.identity.jobTitle[locale],
      tagline: site.identity.tagline[locale],
    },
    hero: heroFields(locale, saved),
    about: {
      headline: site.about.headline[locale],
      bio: site.about.bio[locale],
      autoStats: site.about.autoStats,
    },
    process: processFields(locale, saved),
    contact: contactFields(),
    cv: { cvFullstack: cv.fullstack, cvAi: cv.ai },
    seo: { title: site.seo.title[locale], description: site.seo.description[locale] },
  }
}

export async function seedSite(payload: Payload, cv: CvMediaIds): Promise<void> {
  const api = seedApi(payload)
  const args = { slug: 'site', overrideAccess: true, context: SEED_CONTEXT, depth: 0 }
  const french = await api.updateGlobal({ ...args, data: buildSite('fr', null, cv), locale: 'fr' })
  await api.updateGlobal({ ...args, data: buildSite('en', french, cv), locale: 'en' })
}
