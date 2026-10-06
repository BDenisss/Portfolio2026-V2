import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Payload } from 'payload'
import { findIdWhere, seedApi, SEED_CONTEXT, type Id } from './upsert'

const CV_FILES = {
  fullstack: {
    filename: 'CV_Denis_Bucspun_2026_FR.pdf',
    alt: 'CV Denis Bucspun — Développeur Full Stack',
  },
  ai: {
    filename: 'CV_Denis_Bucspun_2026_IA.pdf',
    alt: 'CV Denis Bucspun — Ingénieur Logiciel IA / GenAI',
  },
} as const

export type CvMediaIds = { readonly fullstack: Id | null; readonly ai: Id | null }

const DEFAULT_CV_DIRECTORY = 'img'

/**
 * Les vrais CV vivent dans `img/` (ignoré par git, ils contiennent un téléphone). La CI n'y a pas accès :
 * elle pointe `SEED_CV_DIR` vers de faux PDF pour que le bouton CV du hero existe et reste testé.
 */
export function cvDirectory(env: Readonly<Record<string, string | undefined>> = process.env): string {
  return env.SEED_CV_DIR || DEFAULT_CV_DIRECTORY
}

async function ensureMedia(
  payload: Payload,
  file: { filename: string; alt: string },
): Promise<Id | null> {
  const filePath = resolve(cvDirectory(), file.filename)
  if (!existsSync(filePath)) return null
  const existing = await findIdWhere(payload, 'media', { filename: { equals: file.filename } })
  if (existing !== null) return existing
  const created = await seedApi(payload).create({
    collection: 'media',
    filePath,
    data: { alt: file.alt },
    overrideAccess: true,
    context: SEED_CONTEXT,
    locale: 'fr',
  })
  return created.id
}

/** Sans CV dans le dossier (voir `cvDirectory`), le site n'a simplement pas de bouton CV. */
export async function seedCvMedia(payload: Payload): Promise<CvMediaIds> {
  return {
    fullstack: await ensureMedia(payload, CV_FILES.fullstack),
    ai: await ensureMedia(payload, CV_FILES.ai),
  }
}
