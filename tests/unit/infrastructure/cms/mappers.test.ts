import { describe, expect, it } from 'vitest'
import type {
  Cinematic as CinematicDoc,
  Experience as ExperienceDoc,
  Project as ProjectDoc,
  Service as ServiceDoc,
  Stack as StackDoc,
  Site as SiteDoc,
} from '@/infrastructure/cms/payload/payload-types'
import {
  mapCinematic,
  mapExperience,
  mapMedia,
  mapProject,
  mapProjectSummary,
  mapService,
  mapSite,
  mapStack,
} from '@/infrastructure/cms/payload/mappers'

const populatedMedia = {
  id: 7,
  url: '/media/portrait.webp',
  alt: 'Portrait',
  width: 400,
  height: 500,
  mimeType: 'image/webp',
}
const populatedStack: StackDoc = {
  id: 3,
  name: 'Docker',
  slug: 'docker',
  category: 'devops',
  icon: { simpleIconSlug: 'docker' },
  updatedAt: '',
  createdAt: '',
}
const aProjectDoc = (over: Partial<ProjectDoc> = {}): ProjectDoc => ({
  id: 1,
  title: 'Projet',
  slug: 'projet',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
})

describe('mapMedia', () => {
  it('renvoie null pour un id non peuplé, null, ou un objet sans url', () => {
    expect(mapMedia(7)).toBeNull()
    expect(mapMedia(null)).toBeNull()
    expect(mapMedia({ id: 7 })).toBeNull()
  })
  it('mappe un média peuplé', () => {
    expect(mapMedia(populatedMedia)).toEqual({
      url: '/media/portrait.webp',
      alt: 'Portrait',
      width: 400,
      height: 500,
      mimeType: 'image/webp',
    })
  })
  it('met une chaîne vide quand le texte alternatif est absent', () => {
    expect(mapMedia({ url: '/x.pdf' })).toMatchObject({ alt: '', width: null, mimeType: null })
  })
})

describe('mapStack', () => {
  it("convertit l'id en string et résout l'icône Simple Icons", () => {
    const stack = mapStack(populatedStack)
    expect(stack).toMatchObject({ id: '3', slug: 'docker', category: 'devops', featured: false })
    expect(stack?.icon.kind).toBe('simple')
  })
  it('renvoie null pour un id non peuplé', () => {
    expect(mapStack(3)).toBeNull()
  })
})

describe('mapService', () => {
  it('copie les champs', () => {
    const doc: ServiceDoc = {
      id: 2,
      title: 'IA',
      description: 'Agents',
      icon: 'bot',
      tint: 'teal',
      updatedAt: '',
      createdAt: '',
    }
    expect(mapService(doc)).toEqual({
      id: '2',
      title: 'IA',
      description: 'Agents',
      icon: 'bot',
      tint: 'teal',
    })
  })
})

describe('mapExperience', () => {
  it('mappe les puces et ignore les stacks non peuplés', () => {
    const doc: ExperienceDoc = {
      id: 4,
      kind: 'work',
      role: 'Dev',
      organization: 'Axima',
      start: '2023-02-01',
      highlights: [{ text: 'A' }, { text: 'B' }],
      stacks: [1, populatedStack],
      updatedAt: '',
      createdAt: '',
    }
    const experience = mapExperience(doc)
    expect(experience.highlights).toEqual(['A', 'B'])
    expect(experience.stacks.map((stack) => stack.slug)).toEqual(['docker'])
    expect(experience).toMatchObject({ location: null, end: null, summary: '' })
  })
})

describe('mapProject', () => {
  it('met caseStudy à null et les liens à null par défaut', () => {
    const project = mapProject(aProjectDoc())
    expect(project.caseStudy).toBeNull()
    expect(project.links).toEqual({ live: null, repo: null, caseStudyUrl: null })
  })
  it('calcule stackSlugs depuis les stacks peuplés et ignore les autres', () => {
    const summary = mapProjectSummary(aProjectDoc({ stacks: [9, populatedStack] }))
    expect(summary.stackSlugs).toEqual(['docker'])
    expect(summary.stacks).toHaveLength(1)
  })
  it("conserve l'étude de cas comme document opaque", () => {
    const root = {
      type: 'root',
      children: [],
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    }
    const project = mapProject(aProjectDoc({ caseStudy: { root } }))
    expect(project.caseStudy).toEqual({ root })
  })
})

describe('mapSite', () => {
  const siteDoc = (over: Partial<SiteDoc> = {}): SiteDoc => ({
    id: 1,
    identity: { name: 'Denis Bucspun', jobTitle: 'Dev' },
    contact: { email: 'a@b.co', contactTo: 'secret@b.co', showPhone: false },
    ...over,
  })
  it("n'expose pas contactTo", () => {
    expect(mapSite(siteDoc()).contact).not.toHaveProperty('contactTo')
  })
  it('met une chaîne vide pour les textes absents et null pour les CV non peuplés', () => {
    const site = mapSite(siteDoc({ cv: { cvFullstack: 5, cvAi: null } }))
    expect(site.tagline).toBe('')
    expect(site.cv).toEqual({ fullstack: null, ai: null })
  })
  it('mappe les CV peuplés', () => {
    const site = mapSite(
      siteDoc({ cv: { cvFullstack: { ...populatedMedia, updatedAt: '', createdAt: '' } } }),
    )
    expect(site.cv.fullstack?.url).toBe('/media/portrait.webp')
  })
})

describe('mapCinematic', () => {
  it('met null pour les slots non peuplés', () => {
    const doc: CinematicDoc = { id: 1, avatarModel: 3, heroVideoDesktop: { mp4: null } }
    const cinematic = mapCinematic(doc)
    expect(cinematic.avatarModel).toBeNull()
    expect(cinematic.heroVideoDesktop).toEqual({ mp4: null, webm: null })
    expect(cinematic.scrubVideo).toBeNull()
  })
})
