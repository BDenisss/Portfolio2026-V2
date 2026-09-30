import type { Experience } from '@/domain'
import type { Experience as ExperienceDoc } from '../payload-types'
import { mapStack } from './stack'
import { keepPresent, orEmpty, orNull } from './values'

export function mapExperience(doc: ExperienceDoc): Experience {
  return {
    id: String(doc.id),
    kind: doc.kind,
    role: doc.role,
    organization: doc.organization,
    location: orNull(doc.location),
    start: doc.start,
    end: orNull(doc.end),
    summary: orEmpty(doc.summary),
    highlights: (doc.highlights ?? []).map((highlight) => highlight.text),
    stacks: keepPresent((doc.stacks ?? []).map(mapStack)),
  }
}
