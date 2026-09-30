import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'

const ALT_REQUIRED_MESSAGE = 'Texte alternatif requis pour les images.'

export function validateAlt(value: unknown, mimeType: unknown): true | string {
  const isImage = typeof mimeType === 'string' && mimeType.startsWith('image/')
  const isBlank = typeof value !== 'string' || value.trim() === ''
  return isImage && isBlank ? ALT_REQUIRED_MESSAGE : true
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'filename', group: 'Médias' },
  upload: {
    mimeTypes: [
      'image/*',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'model/gltf-binary',
      'application/octet-stream',
    ],
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 960 },
      { name: 'hero', width: 1920 },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
    staticDir: path.resolve(process.cwd(), 'media'), // <racine>/media, ignoré par git
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: {
        description: 'Décrit l’image pour les lecteurs d’écran (obligatoire pour les images).',
      },
      validate: (value: unknown, { data }: { data?: { mimeType?: unknown } }) =>
        validateAlt(value, data?.mimeType),
    },
  ],
}
