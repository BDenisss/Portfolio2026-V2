import { revalidatePath as nextRevalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import {
  pathsToRevalidate,
  type RevalidationKind,
} from '@/application/revalidation/paths-to-revalidate'

export type RevalidateFn = (path: string) => void

const defaultRevalidate: RevalidateFn = (path) => nextRevalidatePath(path)

function revalidateAll(paths: string[], revalidate: RevalidateFn): void {
  for (const path of new Set(paths)) {
    try {
      revalidate(path)
    } catch {
      // Hors contexte de requête Next (seed, scripts, tests) : il n'y a aucun cache à invalider.
    }
  }
}

const slugOf = (doc: unknown): string | null =>
  doc && typeof doc === 'object' ? ((doc as { slug?: string }).slug ?? null) : null

export function createRevalidateHook(
  kind: RevalidationKind,
  revalidate: RevalidateFn = defaultRevalidate,
): CollectionAfterChangeHook {
  return ({ doc, previousDoc, req }) => {
    if (req.context?.disableRevalidate) return doc
    const paths = [
      ...pathsToRevalidate(kind, slugOf(doc)),
      ...pathsToRevalidate(kind, slugOf(previousDoc)),
    ]
    revalidateAll(paths, revalidate)
    return doc
  }
}

export function createRevalidateDeleteHook(
  kind: RevalidationKind,
  revalidate: RevalidateFn = defaultRevalidate,
): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc
    revalidateAll(pathsToRevalidate(kind, slugOf(doc)), revalidate)
    return doc
  }
}

export function createRevalidateGlobalHook(
  revalidate: RevalidateFn = defaultRevalidate,
): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc
    revalidateAll(pathsToRevalidate('home'), revalidate)
    return doc
  }
}
