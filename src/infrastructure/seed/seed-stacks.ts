import type { Payload } from 'payload'
import { stackSlug, stacks } from './data/stacks'
import type { SeedStack } from './data/types'
import { upsertOnce, type Id } from './upsert'

const ORDER_STEP = 10

function stackFields(stack: SeedStack, slug: string, index: number): Record<string, unknown> {
  return {
    name: stack.name,
    slug,
    category: stack.category,
    featured: Boolean(stack.featured),
    order: (index + 1) * ORDER_STEP,
    icon: { simpleIconSlug: stack.simpleIconSlug ?? null },
  }
}

/** Renvoie les ids par slug de stack, pour relier projets et expériences. */
export async function seedStacks(payload: Payload): Promise<ReadonlyMap<string, Id>> {
  const ids = new Map<string, Id>()
  for (const [index, stack] of stacks.entries()) {
    const slug = stackSlug(stack)
    const id = await upsertOnce(
      payload,
      { collection: 'stacks', where: { slug: { equals: slug } } },
      stackFields(stack, slug, index),
    )
    ids.set(slug, id)
  }
  return ids
}

export function resolveStackIds(slugs: readonly string[], ids: ReadonlyMap<string, Id>): Id[] {
  return slugs.flatMap((slug) => {
    const id = ids.get(slug)
    return id === undefined ? [] : [id]
  })
}
