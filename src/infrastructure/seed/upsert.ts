import type { CollectionSlug, Payload, Where } from 'payload'
import type { Locale } from '@/domain'

/** Le seed tourne hors requête Next : aucun cache à invalider. */
export const SEED_CONTEXT = { disableRevalidate: true } as const

export type Id = number | string
export type Fields = Record<string, unknown>
export type SavedDoc = { readonly id: Id } & Readonly<Record<string, unknown>>

// L'API locale est générique sur le slug de collection : on la réduit ici, en un seul endroit,
// à l'interface dont le seed a besoin (les données sont validées par Payload à l'écriture).
type SeedApi = {
  find(args: Fields): Promise<{ docs: SavedDoc[] }>
  create(args: Fields): Promise<SavedDoc>
  update(args: Fields): Promise<SavedDoc>
  updateGlobal(args: Fields): Promise<SavedDoc>
}

export const seedApi = (payload: Payload): SeedApi => payload as unknown as SeedApi

const writeOptions = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

export async function findIdWhere(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
): Promise<Id | null> {
  const { docs } = await seedApi(payload).find({
    collection,
    where,
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    locale: 'fr',
  })
  return docs[0]?.id ?? null
}

type Target = { readonly collection: CollectionSlug; readonly where: Where }

/** Crée ou met à jour un document sans champ localisé. */
export async function upsertOnce(payload: Payload, target: Target, data: Fields): Promise<Id> {
  const api = seedApi(payload)
  const id = await findIdWhere(payload, target.collection, target.where)
  const args = { collection: target.collection, ...writeOptions, data, locale: 'fr' }
  const saved = id === null ? await api.create(args) : await api.update({ ...args, id })
  return saved.id
}

/**
 * Crée ou met à jour un document localisé : le français d'abord, puis l'anglais sur le même document.
 * `build` reçoit le document français enregistré pour la passe anglaise, afin de réaligner les `id`
 * des lignes de tableaux (partagées entre langues).
 */
export async function upsertLocalized(
  payload: Payload,
  target: Target,
  build: (locale: Locale, saved: SavedDoc | null) => Fields,
): Promise<Id> {
  const api = seedApi(payload)
  const id = await findIdWhere(payload, target.collection, target.where)
  const args = { collection: target.collection, ...writeOptions, locale: 'fr' }
  const data = build('fr', null)
  const saved =
    id === null ? await api.create({ ...args, data }) : await api.update({ ...args, id, data })
  await api.update({ ...args, id: saved.id, data: build('en', saved), locale: 'en' })
  return saved.id
}

export async function upsertBySlug(
  payload: Payload,
  collection: CollectionSlug,
  slug: string,
  build: (locale: Locale, saved: SavedDoc | null) => Fields,
): Promise<Id> {
  return upsertLocalized(payload, { collection, where: { slug: { equals: slug } } }, build)
}

/** Réinjecte les `id` des lignes déjà enregistrées (par position) pour que la langue suivante les réutilise. */
export function withRowIds<T extends Fields>(rows: readonly T[], savedRows: unknown): Fields[] {
  const existing = Array.isArray(savedRows) ? (savedRows as Array<{ id?: string }>) : []
  return rows.map((row, index) => {
    const id = existing[index]?.id
    return id ? { ...row, id } : { ...row }
  })
}
