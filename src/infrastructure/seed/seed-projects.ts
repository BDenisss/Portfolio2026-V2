import type { Payload } from 'payload'
import { projects } from './data/projects'
import { lexicalFromParagraphs } from './lexical'
import { resolveStackIds } from './seed-stacks'
import { upsertBySlug, type Id } from './upsert'

export async function seedProjects(
  payload: Payload,
  stackIds: ReadonlyMap<string, Id>,
): Promise<void> {
  for (const [index, project] of projects.entries()) {
    await upsertBySlug(payload, 'projects', project.slug, (locale) => ({
      slug: project.slug,
      _status: 'published',
      year: project.year,
      client: project.client,
      featured: project.featured,
      order: index + 1,
      stacks: resolveStackIds(project.stacks, stackIds),
      links: { repo: project.repo ?? null },
      title: project.title[locale],
      tagline: project.tagline[locale],
      summary: project.summary[locale],
      caseStudy: lexicalFromParagraphs(project.caseStudy[locale]),
    }))
  }
}
