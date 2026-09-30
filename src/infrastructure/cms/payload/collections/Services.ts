import type { CollectionConfig } from 'payload'
import { anyone, isAdmin } from '@/infrastructure/cms/payload/access'
import { DEFAULT_ORDER } from '@/infrastructure/cms/payload/collections/constants'
import {
  createRevalidateDeleteHook,
  createRevalidateHook,
} from '@/infrastructure/cms/payload/hooks/revalidate'
import { SERVICE_ICON_NAMES } from '@/domain'

const SERVICE_TINTS = ['amber', 'violet', 'blue', 'teal'] as const

const toOption = (value: string) => ({ label: value, value })

export const Services: CollectionConfig = {
  slug: 'services',
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'icon', 'order'], group: 'Contenu' },
  hooks: {
    afterChange: [createRevalidateHook('home')],
    afterDelete: [createRevalidateDeleteHook('home')],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true, required: true },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'layers',
      options: SERVICE_ICON_NAMES.map(toOption),
    },
    {
      name: 'tint',
      type: 'select',
      required: true,
      defaultValue: 'violet',
      options: SERVICE_TINTS.map(toOption),
    },
    { name: 'order', type: 'number', defaultValue: DEFAULT_ORDER },
  ],
}
