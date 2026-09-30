import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { slugify, STACK_CATEGORIES, type StackCategory } from '@/domain'

const CATEGORY_LABELS: Record<StackCategory, string> = {
  language: 'Langages',
  frontend: 'Frontend',
  backend: 'Backend',
  architecture: 'Architecture',
  testing: 'Tests',
  devops: 'DevOps & Cloud',
  security: 'Sécurité',
  ai: 'IA',
}

const ICON_SLUG_PATTERN = /^[a-z0-9]+$/
const DEFAULT_ORDER = 100

const validateIconSlug = (value: unknown): true | string =>
  !value || ICON_SLUG_PATTERN.test(String(value)) ? true : 'Slug en minuscules, sans espaces.'

const fillSlugFromName: CollectionBeforeValidateHook = ({ data }) =>
  data && !data.slug && data.name ? { ...data, slug: slugify(String(data.name)) } : data

export const Stacks: CollectionConfig = {
  slug: 'stacks',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featured', 'order'],
    group: 'Contenu',
  },
  hooks: { beforeValidate: [fillSlugFromName] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'Généré depuis le nom si vide.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: STACK_CATEGORIES.map((value) => ({ label: CATEGORY_LABELS[value], value })),
    },
    {
      name: 'icon',
      type: 'group',
      admin: {
        description:
          'Tape un slug Simple Icons (ex. docker, react — voir simpleicons.org) ou uploade un SVG. Sans icône, un monogramme est affiché.',
      },
      fields: [
        { name: 'simpleIconSlug', type: 'text', validate: validateIconSlug },
        { name: 'upload', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: DEFAULT_ORDER },
  ],
}
