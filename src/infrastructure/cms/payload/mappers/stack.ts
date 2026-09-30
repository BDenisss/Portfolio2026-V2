import type { Stack } from '@/domain'
import { slugify } from '@/domain'
import { resolveStackIcon } from '@/infrastructure/icons/simple-icons-resolver'
import type { Stack as StackDoc } from '../payload-types'
import { mapMedia } from './media'
import { isPopulated } from './values'

function uploadOf(doc: StackDoc): { url: string; alt: string } | null {
  const media = mapMedia(doc.icon?.upload)
  return media ? { url: media.url, alt: media.alt } : null
}

export function mapStack(stack: unknown): Stack | null {
  if (!isPopulated(stack)) return null
  const doc = stack as unknown as StackDoc
  return {
    id: String(doc.id),
    name: doc.name,
    slug: doc.slug || slugify(doc.name),
    category: doc.category,
    featured: Boolean(doc.featured),
    icon: resolveStackIcon({
      name: doc.name,
      simpleIconSlug: doc.icon?.simpleIconSlug,
      upload: uploadOf(doc),
    }),
  }
}
