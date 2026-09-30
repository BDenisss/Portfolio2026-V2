import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Experiences } from '@/infrastructure/cms/payload/collections/Experiences'
import { Media } from '@/infrastructure/cms/payload/collections/Media'
import { Messages } from '@/infrastructure/cms/payload/collections/Messages'
import { Projects } from '@/infrastructure/cms/payload/collections/Projects'
import { Services } from '@/infrastructure/cms/payload/collections/Services'
import { Stacks } from '@/infrastructure/cms/payload/collections/Stacks'
import { Users } from '@/infrastructure/cms/payload/collections/Users'
import { Cinematic } from '@/infrastructure/cms/payload/globals/Cinematic'
import { Site } from '@/infrastructure/cms/payload/globals/Site'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, '../../..') }, // = src/
    meta: { titleSuffix: ' — Portfolio CMS' },
  },
  collections: [Users, Media, Stacks, Projects, Services, Experiences, Messages],
  globals: [Site, Cinematic],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev : push auto du schéma. CI/prod : migrations uniquement (`pnpm migrate`).
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  localization: {
    locales: [
      { label: 'Français', code: 'fr' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  i18n: { fallbackLanguage: 'fr', supportedLanguages: { fr, en } },
  sharp,
  cors: siteUrl ? [siteUrl] : [],
  csrf: siteUrl ? [siteUrl] : [],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: { media: true },
      token: blobToken ?? '',
      // Contourne la limite de corps (4,5 Mo) des fonctions Vercel : vidéos et GLB partent directement vers Blob.
      clientUploads: true,
    }),
  ],
})
