import type {
  AboutContent,
  ContactDetails,
  HeroContent,
  ProcessContent,
  SiteProfile,
} from '@/domain'
import type { Site as SiteDoc } from '../payload-types'
import { mapMedia } from './media'
import { orEmpty, orNull } from './values'

type HeroDoc = NonNullable<SiteDoc['hero']>

function mapHeroLists(hero: HeroDoc): Pick<HeroContent, 'rotatingTitles' | 'chips' | 'trustedBy'> {
  return {
    rotatingTitles: (hero.rotatingTitles ?? []).map((title) => title.text),
    chips: (hero.chips ?? []).map(({ value, label }) => ({ value, label })),
    trustedBy: (hero.trustedBy ?? []).map(({ name, url }) => ({ name, url: orNull(url) })),
  }
}

function mapHero(doc: SiteDoc['hero']): HeroContent {
  const hero: HeroDoc = doc ?? {}
  return {
    eyebrow: orEmpty(hero.eyebrow),
    ctaPrimary: orEmpty(hero.ctaPrimary),
    ctaSecondary: orEmpty(hero.ctaSecondary),
    trustedByTitle: orEmpty(hero.trustedByTitle),
    ...mapHeroLists(hero),
  }
}

function mapAbout(about: SiteDoc['about']): AboutContent {
  return {
    headline: orEmpty(about?.headline),
    bio: orEmpty(about?.bio),
    autoStats: about?.autoStats ?? true,
    stats: (about?.stats ?? []).map(({ value, label }) => ({ value, label })),
  }
}

function mapProcess(process: SiteDoc['process']): ProcessContent {
  return {
    headline: orEmpty(process?.headline),
    steps: (process?.steps ?? []).map(({ title, text }) => ({ title, text })),
  }
}

/** `contactTo` (destinataire des notifications) reste côté serveur : il n'est jamais copié ici. */
function mapContact(contact: SiteDoc['contact']): ContactDetails {
  return {
    email: orNull(contact?.email),
    phone: orNull(contact?.phone),
    showPhone: Boolean(contact?.showPhone),
    linkedin: orNull(contact?.linkedin),
    github: orNull(contact?.github),
  }
}

export function mapSite(doc: SiteDoc): SiteProfile {
  return {
    name: doc.identity.name,
    jobTitle: doc.identity.jobTitle,
    tagline: orEmpty(doc.identity.tagline),
    location: orEmpty(doc.identity.location),
    hero: mapHero(doc.hero),
    about: mapAbout(doc.about),
    process: mapProcess(doc.process),
    contact: mapContact(doc.contact),
    cv: { fullstack: mapMedia(doc.cv?.cvFullstack), ai: mapMedia(doc.cv?.cvAi) },
    seo: {
      title: orEmpty(doc.seo?.title),
      description: orEmpty(doc.seo?.description),
      ogImage: mapMedia(doc.seo?.ogImage),
    },
  }
}
