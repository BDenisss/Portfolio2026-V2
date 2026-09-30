import type { Project, ProjectSummary } from '@/domain'
import type { Project as ProjectDoc } from '../payload-types'
import { mapMedia } from './media'
import { mapStack } from './stack'
import { keepPresent, orEmpty, orNull } from './values'

export function mapProjectSummary(doc: ProjectDoc): ProjectSummary {
  const stacks = keepPresent((doc.stacks ?? []).map(mapStack))
  return {
    id: String(doc.id),
    slug: orEmpty(doc.slug),
    title: doc.title,
    tagline: orEmpty(doc.tagline),
    cover: mapMedia(doc.cover),
    year: orNull(doc.year),
    client: orNull(doc.client),
    featured: Boolean(doc.featured),
    stacks,
    stackSlugs: stacks.map((stack) => stack.slug),
  }
}

export function mapProject(doc: ProjectDoc): Project {
  return {
    ...mapProjectSummary(doc),
    summary: orEmpty(doc.summary),
    caseStudy: doc.caseStudy ? { root: doc.caseStudy.root } : null,
    gallery: keepPresent((doc.gallery ?? []).map(mapMedia)),
    links: {
      live: orNull(doc.links?.live),
      repo: orNull(doc.links?.repo),
      caseStudyUrl: orNull(doc.links?.caseStudyUrl),
    },
  }
}
