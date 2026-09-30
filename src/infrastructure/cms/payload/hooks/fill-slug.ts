import type { CollectionBeforeValidateHook } from 'payload'
import { slugify } from '@/domain'

/** Génère le slug depuis `sourceField` quand l'éditeur n'en a pas saisi. */
export function createFillSlugHook(sourceField: 'name' | 'title'): CollectionBeforeValidateHook {
  return ({ data }) =>
    data && !data.slug && data[sourceField]
      ? { ...data, slug: slugify(String(data[sourceField])) }
      : data
}
