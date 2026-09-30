import { describe, expect, it } from 'vitest'
import { SERVICE_ICON_NAMES, STACK_CATEGORIES } from '@/domain'
import { hasSimpleIcon } from '@/infrastructure/icons/simple-icons-resolver'
import { experiences } from '@/infrastructure/seed/data/experiences'
import { projects } from '@/infrastructure/seed/data/projects'
import { services } from '@/infrastructure/seed/data/services'
import { site } from '@/infrastructure/seed/data/site'
import { stackSlug, stacks } from '@/infrastructure/seed/data/stacks'

const stackSlugs = new Set(stacks.map(stackSlug))
const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

describe('seed — stacks', () => {
  it('slugs uniques', () => expect(stackSlugs.size).toBe(stacks.length))
  it('catégories valides', () => {
    const valid = new Set<string>(STACK_CATEGORIES)
    for (const stack of stacks) expect(valid.has(stack.category), stack.name).toBe(true)
  })
  it('tout simpleIconSlug déclaré existe dans simple-icons (sinon retirer → monogramme)', () => {
    for (const stack of stacks) {
      if (stack.simpleIconSlug) {
        expect(hasSimpleIcon(stack.simpleIconSlug), `${stack.name}:${stack.simpleIconSlug}`).toBe(
          true,
        )
      }
    }
  })
  it('≥ 28 technologies', () => expect(stacks.length).toBeGreaterThanOrEqual(28))
})

describe('seed — références', () => {
  it('projets et expériences ne citent que des stacks existants', () => {
    for (const entry of [...projects, ...experiences]) {
      for (const slug of entry.stacks) expect(stackSlugs.has(slug), slug).toBe(true)
    }
  })
  it('icônes de service dans la liste blanche', () => {
    for (const service of services) expect(SERVICE_ICON_NAMES).toContain(service.icon)
  })
  it('4 services, 5 projets (≥ 3 mis en avant), slugs de projets uniques', () => {
    expect(services).toHaveLength(4)
    expect(projects).toHaveLength(5)
    expect(projects.filter((project) => project.featured).length).toBeGreaterThanOrEqual(3)
    expect(new Set(projects.map((project) => project.slug)).size).toBe(5)
  })
  it('5 entrées de parcours (4 expériences + la formation), clés uniques', () => {
    expect(experiences).toHaveLength(5)
    expect(new Set(experiences.map((experience) => experience.key)).size).toBe(5)
    expect(experiences.filter((experience) => experience.kind === 'education')).toHaveLength(1)
  })
})

describe('seed — contenu', () => {
  const all = strings([site, services, experiences, projects])
  it('aucune chaîne vide', () => {
    for (const text of all) expect(text.trim().length).toBeGreaterThan(0)
  })
  it('les textes localisés diffèrent entre le français et l’anglais', () => {
    expect(site.identity.jobTitle.fr).not.toBe(site.identity.jobTitle.en)
    for (const service of services) expect(service.title.fr).not.toBe(service.title.en)
    for (const project of projects) expect(project.summary.fr).not.toBe(project.summary.en)
  })
  it('aucun numéro de téléphone dans les données commitées', () => {
    // Formats FR : « +33 6 46 82 48 26 » et « 06 46 82 48 26 » (les dates ISO 2024-10-01 ne doivent pas matcher).
    const PHONE = /(\+\d{1,3}[\s.-]?\d[\d\s.-]{7,}|\b0\d(?:[\s.-]?\d{2}){4}\b)/
    for (const text of all) expect(PHONE.test(text), text).toBe(false)
  })
  it('aucun témoignage inventé', () => {
    expect(JSON.stringify(site).toLowerCase()).not.toMatch(/témoignage|testimonial/)
  })
  it('les textes FR et EN ont le même nombre de puces et de paragraphes', () => {
    for (const experience of experiences) {
      expect(experience.highlights.en).toHaveLength(experience.highlights.fr.length)
    }
    for (const project of projects) {
      expect(project.caseStudy.en).toHaveLength(project.caseStudy.fr.length)
    }
    expect(site.process.steps.map((step) => step.title.en)).toHaveLength(site.process.steps.length)
  })
})
