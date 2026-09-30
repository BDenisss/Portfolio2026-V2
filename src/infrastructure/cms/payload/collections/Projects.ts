import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrAdmin } from '@/infrastructure/cms/payload/access'
import { DEFAULT_ORDER } from '@/infrastructure/cms/payload/collections/constants'
import { createFillSlugHook } from '@/infrastructure/cms/payload/hooks/fill-slug'
import {
  createRevalidateDeleteHook,
  createRevalidateHook,
} from '@/infrastructure/cms/payload/hooks/revalidate'

const HTTP_URL = /^https?:\/\//
const MAX_VERSIONS_PER_PROJECT = 10
const MIN_YEAR = 2000
const MAX_YEAR = 2100

const validateHttpUrl = (value: unknown): true | string =>
  !value || HTTP_URL.test(String(value)) ? true : 'URL en http(s) attendue.'

const imagesOnly = { mimeType: { contains: 'image' } }

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: { read: publishedOrAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'year', 'featured', '_status'],
    group: 'Contenu',
  },
  versions: { drafts: true, maxPerDoc: MAX_VERSIONS_PER_PROJECT },
  hooks: {
    beforeValidate: [createFillSlugHook('title')],
    afterChange: [createRevalidateHook('project')],
    afterDelete: [createRevalidateDeleteHook('project')],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Généré depuis le titre si vide. Change-le avec précaution : il sert d’URL.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: { description: 'Une phrase — affichée sur la carte.' },
    },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'caseStudy', type: 'richText', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media', filterOptions: imagesOnly },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      filterOptions: imagesOnly,
    },
    { name: 'stacks', type: 'relationship', relationTo: 'stacks', hasMany: true },
    {
      name: 'links',
      type: 'group',
      fields: [
        { name: 'live', type: 'text', validate: validateHttpUrl },
        { name: 'repo', type: 'text', validate: validateHttpUrl },
        { name: 'caseStudyUrl', type: 'text', validate: validateHttpUrl },
      ],
    },
    { name: 'year', type: 'number', min: MIN_YEAR, max: MAX_YEAR },
    { name: 'client', type: 'text' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: DEFAULT_ORDER, admin: { position: 'sidebar' } },
  ],
}
