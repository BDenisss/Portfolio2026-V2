import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

export default buildConfig({
  collections: [],
  secret: process.env.PAYLOAD_SECRET ?? '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
  sharp,
  editor: lexicalEditor(),
})
