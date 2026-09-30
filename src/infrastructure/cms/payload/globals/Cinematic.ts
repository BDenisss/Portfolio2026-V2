import type { Field, FilterOptions, GlobalConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { createRevalidateGlobalHook } from '@/infrastructure/cms/payload/hooks/revalidate'

const image: FilterOptions = { mimeType: { contains: 'image' } }
const video = (extension: 'mp4' | 'webm'): FilterOptions => ({ mimeType: { contains: extension } })

const slot = (name: string, description: string, filterOptions: FilterOptions): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  filterOptions,
  admin: { description },
})

const videoPair = (name: string, description: string): Field => ({
  name,
  type: 'group',
  admin: { description },
  fields: [
    slot('mp4', 'Fichier .mp4 (H.264).', video('mp4')),
    slot('webm', 'Fichier .webm (VP9) — optionnel.', video('webm')),
  ],
})

export const Cinematic: GlobalConfig = {
  slug: 'cinematic',
  label: 'Médias cinématiques',
  admin: {
    group: 'Réglages',
    description:
      'Avatar 3D et vidéos du hero. Tous les slots sont optionnels : le site a un repli pour chacun.',
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [createRevalidateGlobalHook()] },
  fields: [
    slot('avatarModel', 'Avatar 3D (.glb compressé meshopt, ≤ 3 Mo).', {
      filename: { like: '.glb' },
    }),
    slot(
      'avatarPortrait',
      'Portrait de l’avatar (PNG/WebP transparent, ≤ 150 Ko) — repli si pas de 3D.',
      image,
    ),
    slot(
      'heroPoster',
      'Poster du hero (WebP/AVIF ≤ 150 Ko) — première image affichée (LCP).',
      image,
    ),
    videoPair('heroVideoDesktop', 'Vidéo d’intro 16:9 (≤ 4 Mo).'),
    videoPair('heroVideoMobile', 'Vidéo d’intro 9:16 (≤ 2 Mo).'),
    slot(
      'scrubVideo',
      'Vidéo de transition « all-intra » scrubée au scroll (≤ 6 Mo).',
      video('mp4'),
    ),
  ],
}
