import type { Payload } from 'payload'
import { experiences } from './data/experiences'
import { resolveStackIds } from './seed-stacks'
import { upsertLocalized, withRowIds, type Id } from './upsert'

/** Clé naturelle d'une expérience : organisation + date de début. */
export async function seedExperiences(
  payload: Payload,
  stackIds: ReadonlyMap<string, Id>,
): Promise<void> {
  for (const [index, experience] of experiences.entries()) {
    const start = new Date(experience.start).toISOString()
    await upsertLocalized(
      payload,
      {
        collection: 'experiences',
        where: {
          and: [
            { organization: { equals: experience.organization } },
            { start: { equals: start } },
          ],
        },
      },
      (locale, saved) => ({
        kind: experience.kind,
        organization: experience.organization,
        location: experience.location ?? null,
        start,
        end: experience.end ? new Date(experience.end).toISOString() : null,
        order: index + 1,
        stacks: resolveStackIds(experience.stacks, stackIds),
        role: experience.role[locale],
        summary: experience.summary[locale],
        highlights: withRowIds(
          experience.highlights[locale].map((text) => ({ text })),
          saved?.highlights,
        ),
      }),
    )
  }
}
